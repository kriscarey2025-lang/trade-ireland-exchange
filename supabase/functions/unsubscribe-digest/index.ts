import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(
        generateHtmlResponse("error", "Invalid unsubscribe link. Please try again from your email."),
        { status: 400, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    // Decode the token to get user_id
    let userId: string;
    try {
      userId = atob(token);
    } catch {
      return new Response(
        generateHtmlResponse("error", "Invalid unsubscribe link. Please try again from your email."),
        { status: 400, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return new Response(
        generateHtmlResponse("error", "Invalid unsubscribe link. Please try again from your email."),
        { status: 400, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update user preferences to disable weekly digest
    const { error } = await supabase
      .from("user_preferences")
      .update({ weekly_digest_enabled: false })
      .eq("user_id", userId);

    if (error) {
      console.error("Error unsubscribing:", error);
      return new Response(
        generateHtmlResponse("error", "Something went wrong. Please try again or contact support."),
        { status: 500, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    console.log(`User ${userId} unsubscribed from weekly digest`);

    return new Response(
      generateHtmlResponse("success", "You have been successfully unsubscribed from the weekly digest."),
      { status: 200, headers: { "Content-Type": "text/html", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in unsubscribe function:", error);
    return new Response(
      generateHtmlResponse("error", "Something went wrong. Please try again."),
      { status: 500, headers: { "Content-Type": "text/html", ...corsHeaders } }
    );
  }
};

function generateHtmlResponse(status: "success" | "error", message: string): string {
  const isSuccess = status === "success";
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isSuccess ? "Unsubscribed" : "Error"} - Swap Skills</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #f5f5f5 0%, #e5e7eb 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 48px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    .icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 32px;
    }
    .icon.success { background: rgba(74, 222, 128, 0.15); }
    .icon.error { background: rgba(239, 68, 68, 0.15); }
    h1 {
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 16px;
    }
    p {
      font-size: 16px;
      color: #6b7280;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
      color: white;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 14px rgba(74, 222, 128, 0.4);
    }
    .logo {
      margin-bottom: 24px;
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #f97316, #4ade80);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🤝 Swap Skills</div>
    <div class="icon ${status}">
      ${isSuccess ? '✓' : '✕'}
    </div>
    <h1>${isSuccess ? "Successfully Unsubscribed" : "Oops!"}</h1>
    <p>${message}</p>
    <a href="https://swap-skills.ie" class="btn">Go to Swap Skills</a>
  </div>
</body>
</html>
  `;
}

serve(handler);
