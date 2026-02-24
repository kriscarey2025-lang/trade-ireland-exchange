import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify caller is admin
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) throw new Error("Not authorized");

    // Get users in target counties
    const targetCounties = ["carlow", "kilkenny", "kildare", "laois"];
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, location")
      .not("email", "is", null);

    if (error) throw error;

    // Filter by location containing target counties (case-insensitive)
    const targetUsers = (profiles || []).filter((p: any) => {
      if (!p.location) return false;
      const loc = p.location.toLowerCase();
      return targetCounties.some((county) => loc.includes(county));
    });

    console.log(`Found ${targetUsers.length} users in target counties`);

    let sent = 0;
    let failed = 0;

    for (const profile of targetUsers) {
      try {
        const firstName = profile.full_name?.split(" ")[0] || "there";

        await resend.emails.send({
          from: "SwapSkills <hello@swap-skills.ie>",
          to: [profile.email],
          subject: "🤝 You're Invited — SwapSkills In-Person Meet-Up in Carlow!",
          html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #fbbf24 50%, #4ade80 100%); padding: 48px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">
                🤝 SwapSkills Meet-Up
              </h1>
              <p style="margin: 12px 0 0 0; font-size: 18px; color: rgba(255, 255, 255, 0.95);">
                In-Person Event — Carlow
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 48px 40px; background-color: #ffffff;">
              <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #1f2937;">
                Hey ${firstName}! 👋
              </h2>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                Great news — we're exploring the idea of hosting a <strong>real-life SwapSkills meet-up in Carlow</strong>! A chance to meet fellow skill-swappers face to face, have a cuppa, and maybe even arrange a swap on the spot.
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                Before we lock in a date and venue, we'd love to know if you'd be interested. It takes 30 seconds:
              </p>
              
              <div style="text-align: center; margin: 36px 0;">
                <a href="https://swap-skills.ie/event/carlow" style="display: inline-block; background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(74, 222, 128, 0.4);">
                  Let Us Know If You'd Come →
                </a>
              </div>
              
              <p style="margin: 24px 0 0 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
                We're looking at both daytime and weekend options — the form lets you share your preference so we can pick the best time for everyone.
              </p>
              
              <p style="margin: 24px 0 0 0; font-size: 16px; color: #4b5563;">
                See you there (hopefully)!<br>
                <strong style="color: #1f2937;">The SwapSkills Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} SwapSkills. All rights reserved.<br>
                <a href="https://swap-skills.ie/privacy" style="color: #6b7280;">Privacy Policy</a> · 
                <a href="https://swap-skills.ie/unsubscribe" style="color: #6b7280;">Unsubscribe</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `,
        });

        sent++;
        console.log(`Sent invite to ${profile.email}`);

        // Rate limit: 800ms delay between emails
        await new Promise((resolve) => setTimeout(resolve, 800));
      } catch (emailError: any) {
        failed++;
        console.error(`Failed to send to ${profile.email}:`, emailError.message);
      }
    }

    console.log(`Event invites complete: ${sent} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({ success: true, sent, failed, total: targetUsers.length }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-event-invite:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
