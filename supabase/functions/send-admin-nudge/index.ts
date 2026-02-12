import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, name, message } = await req.json();

    if (!to || !subject || !message) {
      throw new Error("Missing required fields: to, subject, message");
    }

    const greeting = name ? `Hi ${name}!` : "Hi there!";

    const emailResponse = await resend.emails.send({
      from: "SwapSkills <hello@swap-skills.ie>",
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFF8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <div style="background: linear-gradient(135deg, #F97316, #EA580C); padding: 32px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 8px;">🤝</div>
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">SwapSkills</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 4px 0 0; font-size: 14px;">Ireland's Skill Swap Community</p>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 16px; color: #1a1a1a; margin: 0 0 16px;">${greeting}</p>
            <div style="font-size: 15px; color: #333; line-height: 1.7; white-space: pre-line;">${message}</div>
            <div style="margin-top: 28px; text-align: center;">
              <a href="https://swap-skills.ie/messages" style="display: inline-block; background: linear-gradient(135deg, #F97316, #EA580C); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 15px;">Go to My Messages</a>
            </div>
          </div>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #888;">SwapSkills — Swap what you know for what you need 🍀</p>
          </div>
        </div>
      `,
    });

    console.log("Admin nudge email sent to:", to, emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending admin nudge:", error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
