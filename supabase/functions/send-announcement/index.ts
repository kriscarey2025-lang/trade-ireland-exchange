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
        subject: "Fresh Skills on SwapSkills + New Commenting Feature!",
        html: generateAnnouncementEmail("there", unsubscribeToken),
      });
      return new Response(JSON.stringify({ success: true, sent: 1, test: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Fetch last 90 registered users who are subscribed
    const { data: recentProfiles } = await supabase
      .from("profiles")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(90);

    const recentUserIds = (recentProfiles || []).map((p: any) => p.id);

    const { data: subscribers, error: subscribersError } = await supabase
      .from("user_preferences")
      .select("user_id, weekly_digest_enabled")
      .eq("weekly_digest_enabled", true)
      .in("user_id", recentUserIds);

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
          subject: "Fresh Skills on SwapSkills + New Commenting Feature!",
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
  const listings = [
    { title: "Reiki", category: "Holistic & Wellness", location: "Laois", name: "Christine C.", id: "6c16cf4a-d035-4137-8234-5ace0b4cdbd5" },
    { title: "Reflexology", category: "Holistic & Wellness", location: "Carlow", name: "Lorraine L.", id: "e3349c2c-6f88-4174-9755-ddcb36a6a0b3" },
    { title: "DIY, a Lift, Help Cleaning or Massage", category: "Home Improvement", location: "Cork", name: "John J.", id: "825bd091-a2dc-4cdf-8c39-939f27bc0249" },
    { title: "Private Wellbeing Sessions & Restorative Yoga", category: "Fitness", location: "Carlow", name: "Catriona C.", id: "4cff4746-afdb-4369-918c-daca9fc7424e" },
  ];

  const listingCards = listings.map(l => `
    <div style="background: #fffefa; border-radius: 12px; padding: 20px; margin: 12px 0; border: 1px solid #f0ebe3;">
      <h4 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #1f2937;">${l.title}</h4>
      <p style="margin: 0 0 12px 0; font-size: 13px; color: #6b7280;">
        🏷️ ${l.category} · 📍 ${l.location} · by <strong>${l.name}</strong>
      </p>
      <a href="${baseUrl}/service/${l.id}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600;">
        View Offer →
      </a>
    </div>
  `).join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SwapSkills Digest</title>
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
                Here's what's fresh on SwapSkills — check out the latest skill offers from our community and an exciting new feature! 🎉
              </p>
              
              <!-- Latest Listings -->
              <div style="background: linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%); border-radius: 12px; padding: 28px; margin: 24px 0; border: 1px solid #fed7aa;">
                <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #1f2937;">
                  🔥 Latest Skill Offers
                </h3>
                <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.7; color: #4b5563;">
                  These members are ready to swap — check out their offers and reach out!
                </p>
                ${listingCards}
                <div style="text-align: center; margin-top: 20px;">
                  <a href="${baseUrl}/browse" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);">
                    Browse All Skills →
                  </a>
                </div>
              </div>
              
              <!-- New Commenting Feature -->
              <div style="background: linear-gradient(135deg, #ecfccb 0%, #d9f99d 100%); border-radius: 12px; padding: 28px; margin: 24px 0; border: 1px solid #bef264;">
                <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #1f2937;">
                  💬 New: Comment on Listings!
                </h3>
                <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.7; color: #4b5563;">
                  You can now <strong style="color: #4d7c0f;">ask questions and leave comments</strong> directly on any skill swap offer! Whether you want to clarify details, ask about availability, or just show some love — it's all public and open.
                </p>
                <ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 14px; color: #4b5563; line-height: 2;">
                  <li>❓ Ask questions before reaching out privately</li>
                  <li>💬 Leave feedback and encouragement</li>
                  <li>🔔 Listing owners get notified of new comments</li>
                  <li>🛡️ Report inappropriate comments easily</li>
                </ul>
                <div style="text-align: center; margin-top: 20px;">
                  <a href="${baseUrl}/browse" style="display: inline-block; background: linear-gradient(135deg, #4d7c0f 0%, #365314 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; box-shadow: 0 2px 8px rgba(77, 124, 15, 0.3);">
                    Try Commenting Now →
                  </a>
                </div>
              </div>
              
              <!-- Closing -->
              <div style="margin-top: 32px; padding: 24px; background: #faf8f5; border-radius: 12px; text-align: center;">
                <p style="margin: 0 0 12px 0; font-size: 16px; color: #4b5563; line-height: 1.7;">
                  Got a skill to share? Post your own listing and start swapping! 🚀
                </p>
                <a href="${baseUrl}/new" style="display: inline-block; color: #f97316; text-decoration: underline; font-size: 15px; font-weight: 600;">
                  Create a Listing →
                </a>
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
