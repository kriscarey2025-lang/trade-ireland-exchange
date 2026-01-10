import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
  location: string;
  redirectUrl: string;
}

// Simple hash function for IP anonymization
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get client IP
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                     req.headers.get("x-real-ip") ||
                     "unknown";
    
    const ipHash = await hashIP(clientIP);
    console.log("Processing signup request from IP hash:", ipHash.substring(0, 8) + "...");

    // Check rate limit (5 signups per hour per IP)
    const { data: allowed, error: rateLimitError } = await supabaseAdmin.rpc(
      "check_signup_rate_limit",
      { _ip_hash: ipHash, _max_requests: 5, _window_minutes: 60 }
    );

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
      return new Response(
        JSON.stringify({ error: "Unable to process signup at this time" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!allowed) {
      console.log("Rate limit exceeded for IP hash:", ipHash.substring(0, 8) + "...");
      return new Response(
        JSON.stringify({ 
          error: "Too many signup attempts. Please try again later.",
          rateLimited: true 
        }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Parse and validate request body
    const { email, password, fullName, location, redirectUrl }: SignupRequest = await req.json();

    if (!email || !password || !fullName || !location) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create user via Supabase Admin API - AUTO-CONFIRMED, no email verification
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm - no email verification required
      user_metadata: {
        full_name: fullName,
        location: location,
      },
    });

    if (authError) {
      console.error("Auth error:", authError);
      
      // Handle specific error cases
      if (authError.message.includes("already registered")) {
        return new Response(
          JSON.stringify({ error: "An account with this email already exists" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: "Failed to create user" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("User created and auto-confirmed:", authData.user.id);

    // Update profile with location
    await supabaseAdmin
      .from("profiles")
      .update({ location })
      .eq("id", authData.user.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        autoConfirmed: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Signup error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
