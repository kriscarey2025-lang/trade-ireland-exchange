import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SponsorNotification {
  sponsor_id: string;
  email: string;
  tier: string;
  is_public: boolean;
  display_name: string | null;
  website_url: string | null;
  message: string | null;
}

const tierLabels: Record<string, string> = {
  gold: "🏆 Gold Sponsor",
  silver: "🥈 Silver Sponsor", 
  bronze: "🥉 Bronze Sponsor",
  advertising: "💖 Advertising Supporter",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: SponsorNotification = await req.json();
    console.log("[NOTIFY-ADMIN-NEW-SPONSOR] Received payload:", payload);

    const tierLabel = tierLabels[payload.tier] || payload.tier;
    const displayPreference = payload.is_public
      ? payload.display_name
        ? `Public - "${payload.display_name}"${payload.website_url ? ` with website: ${payload.website_url}` : ""}${payload.message ? ` and message: "${payload.message}"` : ""}`
        : "Public (name only)"
      : "Anonymous (not listed publicly)";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
                <h1 style="color: #4d7c0f; margin: 0; font-size: 24px; font-weight: 700;">
                  New Sponsor Alert!
                </h1>
              </div>

              <!-- Content -->
              <div style="background-color: #faf8f5; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Tier:</td>
                    <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 600;">${tierLabel}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Email:</td>
                    <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;">${payload.email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px; vertical-align: top;">Display Preference:</td>
                    <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;">${displayPreference}</td>
                  </tr>
                </table>
              </div>

              ${payload.message ? `
              <div style="background-color: #f0fdf4; border-left: 4px solid #4d7c0f; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                <p style="margin: 0; color: #166534; font-size: 14px; font-style: italic;">
                  "${payload.message}"
                </p>
              </div>
              ` : ""}

              <!-- CTA -->
              <div style="text-align: center;">
                <a href="https://trade-ireland-exchange.lovable.app/sponsors" 
                   style="display: inline-block; background-color: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                  View Sponsors Page
                </a>
              </div>

              <!-- Footer -->
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e5e5; text-align: center;">
                <p style="color: #666; font-size: 12px; margin: 0;">
                  🤝 SwapSkills Ireland - Building community through skill exchange
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const adminEmail = "kristina@swapskills.ie";

    const emailResponse = await resend.emails.send({
      from: "SwapSkills <noreply@swapskills.ie>",
      to: [adminEmail],
      subject: `${tierLabel} - New Sponsor Signup!`,
      html: emailHtml,
    });

    console.log("[NOTIFY-ADMIN-NEW-SPONSOR] Email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[NOTIFY-ADMIN-NEW-SPONSOR] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
