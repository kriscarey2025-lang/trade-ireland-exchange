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
  segment?: 1 | 2;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Starting farewell announcement email...");

    let testEmail: string | null = null;
    let dryRun = false;
    let segment: 1 | 2 = 1;
    try {
      const body: RequestBody = await req.json();
      testEmail = body.test_email || null;
      dryRun = body.dry_run || false;
      segment = body.segment || 1;
    } catch {
      // No body
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const emailSubject = "A message from SwapSkills - Thank you";

    // If test mode, send only to test email
    if (testEmail) {
      console.log(`📧 Test mode: sending to ${testEmail}`);
      const unsubscribeToken = btoa("test-user");
      await resend.emails.send({
        from: "SwapSkills <hello@swap-skills.ie>",
        to: [testEmail],
        subject: emailSubject,
        html: generateFarewellEmail("there", unsubscribeToken),
      });
      return new Response(JSON.stringify({ success: true, sent: 1, test: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Fetch ALL subscribed users ordered by user_id for deterministic splitting
    const { data: allSubscribers, error: subscribersError } = await supabase
      .from("user_preferences")
      .select("user_id")
      .eq("weekly_digest_enabled", true)
      .order("user_id", { ascending: true });

    if (subscribersError) throw subscribersError;

    if (!allSubscribers || allSubscribers.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, reason: "no_subscribers" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Total subscribers: ${allSubscribers.length}, Segment: ${segment}`);

    // Split into two segments
    const midIndex = Math.ceil(allSubscribers.length / 2);
    const segmentSubscribers = segment === 1
      ? allSubscribers.slice(0, midIndex)
      : allSubscribers.slice(midIndex);

    console.log(`Segment ${segment} has ${segmentSubscribers.length} subscribers`);

    let emailsSent = 0;
    let errors: string[] = [];
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (const subscriber of segmentSubscribers) {
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
          subject: emailSubject,
          html: generateFarewellEmail(firstName, unsubscribeToken),
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

    console.log(`Segment ${segment} complete. Sent: ${emailsSent}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({ success: true, sent: emailsSent, segment, errors: errors.length > 0 ? errors : undefined }),
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

function generateFarewellEmail(firstName: string, unsubscribeToken: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A message from SwapSkills</title>
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
                SwapSkills
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">
                Ireland's skill sharing community
              </p>
            </td>
          </tr>
          
          <!-- Main content -->
          <tr>
            <td style="padding: 40px; background-color: #fffefa;">
              <p style="margin: 0 0 8px 0; font-size: 32px; text-align: center;">🤝</p>
              <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 700; color: #1f2937; text-align: center;">
                Hi ${firstName},
              </h2>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                I wanted to reach out personally to share some news about SwapSkills.
              </p>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                After months of building this platform, I've decided to step back from actively promoting and growing SwapSkills. It's been an incredible journey, and I'm genuinely grateful to every single person who signed up, posted a skill, sent a message, or simply believed in the idea of neighbours helping neighbours.
              </p>

              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                I also want to let you know that the <strong>Carlow meet-up</strong> we had planned for April 17th has been <strong>cancelled</strong>.
              </p>

              <!-- The good news -->
              <div style="background: linear-gradient(135deg, #ecfccb 0%, #d9f99d 100%); border-radius: 12px; padding: 28px; margin: 24px 0; border: 1px solid #bef264;">
                <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #1f2937;">
                  The platform stays live
                </h3>
                <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.7; color: #4b5563;">
                  SwapSkills isn't going anywhere. The website will remain fully available — you can still:
                </p>
                <ul style="margin: 0 0 0 0; padding-left: 20px; font-size: 15px; color: #4b5563; line-height: 2;">
                  <li>Post skills you can offer or are looking for</li>
                  <li>Browse what others have listed</li>
                  <li>Message people and make connections</li>
                  <li>Complete swaps and leave reviews</li>
                </ul>
              </div>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                The only thing that's changing is that I won't be actively marketing or promoting the platform. Everything you've come to use will keep working exactly as it does today.
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${baseUrl}/browse" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);">
                  Visit SwapSkills
                </a>
              </div>

              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                Thank you for being part of this community. The spirit of skill-swapping doesn't need a marketing budget — it just needs good people willing to help each other. And that's exactly what you are.
              </p>
              
              <p style="margin: 32px 0 0 0; font-size: 16px; color: #4b5563;">
                With gratitude,<br>
                <strong style="color: #f97316;">Kris</strong><br>
                <span style="font-size: 14px; color: #9ca3af;">Founder, SwapSkills</span>
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
                © ${new Date().getFullYear()} SwapSkills · Made with care in Ireland
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
