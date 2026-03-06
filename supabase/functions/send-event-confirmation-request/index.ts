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

    const eventSlug = "carlow-april-2026-confirm";

    // Get RSVPs who said yes or maybe and still have 'interest' status
    const { data: rsvps, error } = await supabase
      .from("event_rsvps")
      .select("*")
      .in("attendance", ["yes", "maybe"])
      .eq("registration_status", "interest");

    if (error) throw error;

    // Get already-sent confirmation requests
    const { data: alreadySent } = await supabase
      .from("event_invites_sent")
      .select("email")
      .eq("event_slug", eventSlug);

    const sentEmails = new Set((alreadySent || []).map((r: any) => r.email.toLowerCase()));

    // Get users who opted out
    const { data: unsubscribedPrefs } = await supabase
      .from("user_preferences")
      .select("user_id")
      .eq("weekly_digest_enabled", false);

    const unsubscribedUserIds = new Set((unsubscribedPrefs || []).map((p: any) => p.user_id));

    const toEmail = (rsvps || []).filter((r: any) => {
      if (sentEmails.has(r.email.toLowerCase())) return false;
      if (r.user_id && unsubscribedUserIds.has(r.user_id)) return false;
      return true;
    });

    console.log(`${rsvps?.length || 0} eligible RSVPs, ${sentEmails.size} already sent, ${toEmail.length} to send`);

    if (toEmail.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "All confirmation requests already sent" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let sent = 0;
    let failed = 0;

    for (const rsvp of toEmail) {
      try {
        const firstName = rsvp.full_name?.split(" ")[0] || "there";
        const confirmUrl = `https://swap-skills.ie/event/carlow?action=confirm&email=${encodeURIComponent(rsvp.email)}&token=${rsvp.id}`;
        const cancelUrl = `https://swap-skills.ie/event/carlow?action=cancel&email=${encodeURIComponent(rsvp.email)}&token=${rsvp.id}`;

        await resend.emails.send({
          from: "SwapSkills <hello@swap-skills.ie>",
          to: [rsvp.email],
          subject: "🤝 Carlow Meet-Up Confirmed — Please Confirm Your Place!",
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
              <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #ffffff;">
                🤝 It's Official!
              </h1>
              <p style="margin: 12px 0 0 0; font-size: 20px; font-weight: 600; color: rgba(255, 255, 255, 0.95);">
                Carlow Meet-Up — Fri 17th April
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 48px 40px; background-color: #ffffff;">
              <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 700; color: #1f2937;">
                Hey ${firstName}! 👋
              </h2>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                Great news — our <strong>first SwapSkills in-person meet-up</strong> is now confirmed! Thanks for expressing your interest earlier. Here are the details:
              </p>

              <!-- Event Details Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #fef3c7; border-radius: 12px; border: 1px solid #fbbf24;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 8px 0; font-size: 15px; color: #92400e;">📍 <strong>Enterprise House, O'Brien's Road, Carlow</strong></p>
                    <p style="margin: 0 0 8px 0; font-size: 15px; color: #92400e;">📅 <strong>Friday 17th April 2026, 6–8 PM</strong></p>
                    <p style="margin: 0 0 8px 0; font-size: 15px; color: #92400e;">🍃 <strong>Light refreshments provided</strong></p>
                    <p style="margin: 0; font-size: 15px; color: #92400e;">⚠️ <strong>Places are limited</strong></p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                Expect an evening of <strong>skill swapping, connecting with your community</strong>, and learning more about what SwapSkills can do for you.
              </p>

              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                Since places are limited, we need you to <strong>formally confirm your attendance</strong> or free up your spot for someone else:
              </p>
              
              <!-- CTA Buttons -->
              <div style="text-align: center; margin: 36px 0;">
                <a href="${confirmUrl}" style="display: inline-block; background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 17px; font-weight: 700; box-shadow: 0 4px 14px rgba(74, 222, 128, 0.4); margin-bottom: 12px;">
                  Confirm My Place →
                </a>
              </div>
              
              <div style="text-align: center; margin: 0 0 36px 0;">
                <a href="${cancelUrl}" style="display: inline-block; background-color: #f3f4f6; color: #6b7280; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600; border: 1px solid #e5e7eb;">
                  Cancel My RSVP
                </a>
              </div>
              
              <p style="margin: 24px 0 0 0; font-size: 16px; color: #4b5563;">
                Looking forward to seeing you there!<br>
                <strong style="color: #1f2937;">The SwapSkills Team 🇮🇪</strong>
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

        await supabase.from("event_invites_sent").insert({
          email: rsvp.email,
          event_slug: eventSlug,
          user_id: rsvp.user_id || null,
        });

        sent++;
        console.log(`Sent confirmation request to ${rsvp.email}`);

        await new Promise((resolve) => setTimeout(resolve, 800));
      } catch (emailError: any) {
        failed++;
        console.error(`Failed to send to ${rsvp.email}:`, emailError.message);
      }
    }

    console.log(`Confirmation requests complete: ${sent} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({ success: true, sent, failed }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-event-confirmation-request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);