import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const baseUrl = "https://swap-skills.ie";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  test_email?: string;
  dry_run?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Starting announcement email...");

    let testEmail: string | null = null;
    let dryRun = false;
    try {
      const body: RequestBody = await req.json();
      testEmail = body.test_email || null;
      dryRun = body.dry_run || false;
    } catch {
      // No body
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // If test mode, send only to test email
    if (testEmail) {
      console.log(`📧 Test mode: sending to ${testEmail}`);
      const unsubscribeToken = btoa("test-user");
      await resend.emails.send({
        from: "SwapSkills <hello@swap-skills.ie>",
        to: [testEmail],
        subject: "🚀 Big News: Boost Your Listings + Meet Up in Carlow!",
        html: generateAnnouncementEmail("there", unsubscribeToken),
      });
      return new Response(JSON.stringify({ success: true, sent: 1, test: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Fetch all digest subscribers (respect opt-out preferences)
    const { data: subscribers, error: subscribersError } = await supabase
      .from("user_preferences")
      .select("user_id, weekly_digest_enabled")
      .eq("weekly_digest_enabled", true);

    if (subscribersError) throw subscribersError;

    console.log(`Found ${subscribers?.length || 0} subscribers`);

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, reason: "no_subscribers" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let emailsSent = 0;
    let errors: string[] = [];
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (const subscriber of subscribers) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", subscriber.user_id)
        .single();

      if (!profile?.email) {
        console.log(`Skipping ${subscriber.user_id} - no email`);
        continue;
      }

      const firstName = profile.full_name?.split(" ")[0] || "there";
      const unsubscribeToken = btoa(subscriber.user_id);

      if (dryRun) {
        console.log(`[DRY RUN] Would send to ${profile.email} (${firstName})`);
        emailsSent++;
        continue;
      }

      try {
        const { error: emailError } = await resend.emails.send({
          from: "SwapSkills <hello@swap-skills.ie>",
          to: [profile.email],
          subject: "🚀 Big News: Boost Your Listings + Meet Up in Carlow!",
          html: generateAnnouncementEmail(firstName, unsubscribeToken),
        });

        if (emailError) {
          console.error(`Error sending to ${profile.email}:`, JSON.stringify(emailError));
          errors.push(profile.email);
          continue;
        }

        emailsSent++;
        console.log(`✅ Sent to ${profile.email}`);
        await delay(1000);
      } catch (err) {
        console.error(`Failed to send to ${profile.email}:`, err);
        errors.push(profile.email);
      }
    }

    console.log(`Announcement complete. Sent: ${emailsSent}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({ success: true, sent: emailsSent, errors: errors.length > 0 ? errors : undefined }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in announcement:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

function generateAnnouncementEmail(firstName: string, unsubscribeToken: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SwapSkills Announcement</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #faf8f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #fffefa; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #fffefa; padding: 40px 40px 24px 40px; text-align: center; border-bottom: 2px solid #f97316;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #f97316; letter-spacing: -0.5px;">
                🤝 SwapSkills
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">
                Ireland's skill sharing community 🍀
              </p>
            </td>
          </tr>
          
          <!-- Main content -->
          <tr>
            <td style="padding: 40px; background-color: #fffefa;">
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #1f2937;">
                Hi ${firstName}! 👋
              </h2>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                We've got some exciting updates from SwapSkills this week — a brand new feature and our very first in-person meetup! 🎉
              </p>
              
              <!-- Premium Boost Feature -->
              <div style="background: linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%); border-radius: 12px; padding: 28px; margin: 24px 0; border: 1px solid #fed7aa;">
                <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #1f2937;">
                  ✨ New: Boost Your Listing!
                </h3>
                <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.7; color: #4b5563;">
                  Want your skill to stand out? Our new <strong style="color: #f97316;">Premium Boost</strong> feature pins your listing to the top of search results with a shiny gold border and ✨ Boosted badge — all for just <strong>€5 for 30 days</strong>.
                </p>
                <ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 14px; color: #4b5563; line-height: 2;">
                  <li>📌 Pinned to the top of search results</li>
                  <li>🏅 Gold border &amp; "Boosted" badge</li>
                  <li>📊 Weekly performance stats emailed to you</li>
                  <li>⚡ Larger card format for maximum visibility</li>
                </ul>
                <div style="text-align: center; margin-top: 20px;">
                  <a href="${baseUrl}/new" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);">
                    Create &amp; Boost a Listing →
                  </a>
                </div>
              </div>
              
              <!-- Carlow In-Person Meeting -->
              <div style="background: linear-gradient(135deg, #ecfccb 0%, #d9f99d 100%); border-radius: 12px; padding: 28px; margin: 24px 0; border: 1px solid #bef264;">
                <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #1f2937;">
                  📍 Meet Up in Carlow — April 2026!
                </h3>
                <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.7; color: #4b5563;">
                  We're planning our <strong style="color: #4d7c0f;">first ever in-person SwapSkills meetup</strong> in Carlow! Come meet fellow swappers, share skills face-to-face, and be part of something special.
                </p>
                <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">
                  🗓️ <strong>April 2026</strong> · 📍 <strong>Carlow, Ireland</strong><br>
                  Exact date and venue will be confirmed based on RSVPs.
                </p>
                <div style="text-align: center; margin-top: 20px;">
                  <a href="${baseUrl}/event/carlow" style="display: inline-block; background: linear-gradient(135deg, #4d7c0f 0%, #365314 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; box-shadow: 0 2px 8px rgba(77, 124, 15, 0.3);">
                    RSVP Now — It's Free! →
                  </a>
                </div>
              </div>
              
              <!-- Closing -->
              <div style="margin-top: 32px; padding: 24px; background: #faf8f5; border-radius: 12px; text-align: center;">
                <p style="margin: 0 0 12px 0; font-size: 16px; color: #4b5563; line-height: 1.7;">
                  That's all for this week! We're buzzing about what's ahead. 🐝
                </p>
                <p style="margin: 0; font-size: 15px; color: #6b7280;">
                  As always, if you've got any questions, just reply to this email.
                </p>
              </div>
              
              <p style="margin: 32px 0 0 0; font-size: 16px; color: #4b5563;">
                Sláinte,<br>
                <strong style="color: #f97316;">The SwapSkills Team</strong> 🇮🇪
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #faf8f5; padding: 24px 40px; text-align: center; border-top: 1px solid #f0ebe3;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #9ca3af;">
                You're receiving this because you're subscribed to SwapSkills updates.
              </p>
              <a href="${baseUrl}/unsubscribe?token=${unsubscribeToken}" style="font-size: 12px; color: #f97316; text-decoration: underline;">
                Unsubscribe from future emails
              </a>
              <p style="margin: 12px 0 0 0; font-size: 11px; color: #d1d5db;">
                © ${new Date().getFullYear()} SwapSkills · Made with ❤️ in Ireland
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

serve(handler);
