import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get IP from headers (Supabase/Cloudflare provides this)
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || req.headers.get('x-real-ip') 
      || req.headers.get('cf-connecting-ip')
      || 'unknown';
    
    const userAgent = req.headers.get('user-agent') || null;

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      // Return 200 so client code doesn't treat this as a hard failure.
      // This can happen when a local cached session is stale.
      return new Response(
        JSON.stringify({ success: false, skipped: true, reason: 'no_authorization_header' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify user with anon client
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    
    if (userError || !user) {
      console.warn('log-ip: invalid user/session', userError?.message);
      // Return 200 to avoid surfacing as a runtime error in the client.
      return new Response(
        JSON.stringify({ success: false, skipped: true, reason: 'invalid_user' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role to check banned IP and log
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if IP is banned
    const { data: isBanned } = await supabaseAdmin.rpc('is_ip_banned', { _ip_address: clientIp });
    
    if (isBanned) {
      return new Response(
        JSON.stringify({
          success: true,
          banned: true,
          message: 'Access denied. Your IP address has been blocked.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the IP
    await supabaseAdmin.rpc('log_user_ip', { 
      _user_id: user.id, 
      _ip_address: clientIp,
      _user_agent: userAgent
    });

    console.log(`IP logged for user ${user.id}: ${clientIp}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        banned: false,
        ip: clientIp 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in log-ip function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
