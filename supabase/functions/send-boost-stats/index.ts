import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const baseUrl = "https://swap-skills.ie";

interface BoostStats {
  serviceId: string;
  serviceTitle: string;
  views: number;
  interests: number;
  conversations: number;
  daysRemaining: number;
  boostExpiresAt: string;
}

interface RequestBody {
  test_email?: string;
  dry_run?: boolean;
}

async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "SwapSkills <hello@swap-skills.ie>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return response.json();
}

function generateBoostStatsEmail(
  firstName: string,
  stats: BoostStats[],
  unsubscribeToken: string
): string {
  const totalViews = stats.reduce((sum, s) => sum + s.views, 0);
  const totalInterests = stats.reduce((sum, s) => sum + s.interests, 0);
  const totalConversations = stats.reduce((sum, s) => sum + s.conversations, 0);

  const listingsHtml = stats.map(stat => {
    const expiryDate = new Date(stat.boostExpiresAt).toLocaleDateString('en-IE', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    });

    return `
      <tr>
        <td style="padding: 20px; background-color: #fffef5; border-radius: 12px; margin-bottom: 12px; border: 1px solid #fde68a;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td>
                <a href="${baseUrl}/services/${stat.serviceId}" style="text-decoration: none;">
                  <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
                    ✨ ${stat.serviceTitle}
                  </h4>
                </a>
              </td>
            </tr>
            <tr>
              <td>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="text-align: center; padding: 8px;">
                      <span style="font-size: 24px; font-weight: 700; color: #f97316; display: block;">${stat.views}</span>
                      <span style="font-size: 12px; color: #6b7280;">Views</span>
                    </td>
                    <td style="text-align: center; padding: 8px;">
                      <span style="font-size: 24px; font-weight: 700; color: #16a34a; display: block;">${stat.interests}</span>
                      <span style="font-size: 12px; color: #6b7280;">Interests</span>
                    </td>
                    <td style="text-align: center; padding: 8px;">
                      <span style="font-size: 24px; font-weight: 700; color: #2563eb; display: block;">${stat.conversations}</span>
                      <span style="font-size: 12px; color: #6b7280;">Conversations</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding-top: 12px; border-top: 1px solid #fde68a; margin-top: 12px;">
                <span style="font-size: 12px; color: #92400e; background: #fef3c7; padding: 4px 10px; border-radius: 20px;">
                  ⏳ ${stat.daysRemaining} days remaining · Expires ${expiryDate}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td style="height: 12px;"></td></tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Boosted Listing Stats</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #faf8f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #fffefa; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #fffefa; padding: 40px 40px 24px 40px; text-align: center; border-bottom: 2px solid #f59e0b;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #f59e0b; letter-spacing: -0.5px;">
                🤝 SwapSkills
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">
                Your Boost Performance Report ✨
              </p>
            </td>
          </tr>
          
          <!-- Main content -->
          <tr>
            <td style="padding: 40px; background-color: #fffefa;">
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #1f2937;">
                Hi ${firstName}! 📊
              </h2>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                Here's how your boosted ${stats.length === 1 ? 'listing is' : 'listings are'} performing this week:
              </p>
              
              <!-- Overall Stats -->
              <div style="background: linear-gradient(135deg, #fef3c7, #fffbeb); border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center; border: 1px solid #fde68a;">
                <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #92400e; text-transform: uppercase; letter-spacing: 1px;">
                  Weekly Totals
                </p>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="text-align: center; padding: 8px;">
                      <span style="font-size: 32px; font-weight: 700; color: #f97316; display: block;">${totalViews}</span>
                      <span style="font-size: 13px; color: #78716c;">👀 Views</span>
                    </td>
                    <td style="text-align: center; padding: 8px;">
                      <span style="font-size: 32px; font-weight: 700; color: #16a34a; display: block;">${totalInterests}</span>
                      <span style="font-size: 13px; color: #78716c;">💚 Interests</span>
                    </td>
                    <td style="text-align: center; padding: 8px;">
                      <span style="font-size: 32px; font-weight: 700; color: #2563eb; display: block;">${totalConversations}</span>
                      <span style="font-size: 13px; color: #78716c;">💬 Chats</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Individual Listings -->
              <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #1f2937;">
                📋 Listing Breakdown
              </h3>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                ${listingsHtml}
              </table>
              
              <!-- Tip Section -->
              <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #16a34a;">
                <p style="margin: 0; font-size: 14px; color: #1f2937; line-height: 1.6;">
                  <strong>💡 Tip:</strong> Listings with photos and detailed descriptions get up to 3x more interest. 
                  Make sure your listing is looking its best!
                </p>
              </div>
              
              <!-- CTA -->
              <div style="text-align: center; margin-top: 32px;">
                <a href="${baseUrl}/profile" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #f97316); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);">
                  View Your Listings →
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #faf8f5; padding: 25px 40px; border-top: 1px solid #f0ebe3;">
              <p style="margin: 0 0 10px 0; color: #78716c; font-size: 13px; text-align: center;">
                🍀 SwapSkills – Ireland's skill sharing community
              </p>
              <p style="margin: 0; color: #78716c; font-size: 12px; text-align: center;">
                <a href="${baseUrl}/unsubscribe?token=${unsubscribeToken}" style="color: #78716c; text-decoration: underline;">Unsubscribe</a> · 
                <a href="${baseUrl}/privacy" style="color: #78716c; text-decoration: underline;">Privacy</a> · 
                Made with 💚 in Ireland
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting boost stats email job...");

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

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all active boosted listings
    const { data: activeBoostedListings, error: boostError } = await supabase
      .from("boosted_listings")
      .select("service_id, user_id, expires_at")
      .eq("status", "active")
      .gt("expires_at", now.toISOString());

    if (boostError) throw boostError;

    if (!activeBoostedListings || activeBoostedListings.length === 0) {
      console.log("No active boosted listings found");
      return new Response(
        JSON.stringify({ success: true, sent: 0, reason: "no_active_boosts" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${activeBoostedListings.length} active boosted listings`);

    // Group by user
    const userBoosts = new Map<string, typeof activeBoostedListings>();
    for (const boost of activeBoostedListings) {
      const existing = userBoosts.get(boost.user_id) || [];
      existing.push(boost);
      userBoosts.set(boost.user_id, existing);
    }

    let emailsSent = 0;
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (const [userId, boosts] of userBoosts) {
      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", userId)
        .single();

      if (!profile?.email) {
        console.log(`No email for user ${userId}, skipping`);
        continue;
      }

      // If test_email is set, only send to that email
      if (testEmail && profile.email !== testEmail) continue;

      const firstName = profile.full_name?.split(" ")[0] || "there";
      const stats: BoostStats[] = [];

      for (const boost of boosts) {
        // Get service title
        const { data: service } = await supabase
          .from("services")
          .select("title")
          .eq("id", boost.service_id)
          .single();

        if (!service) continue;

        // Count views (browse_nudges records for this service in the last week)
        const { count: viewCount } = await supabase
          .from("browse_nudges")
          .select("*", { count: "exact", head: true })
          .eq("service_id", boost.service_id)
          .gte("viewed_at", oneWeekAgo.toISOString());

        // Count interests in the last week
        const { count: interestCount } = await supabase
          .from("interests")
          .select("*", { count: "exact", head: true })
          .eq("service_id", boost.service_id)
          .gte("created_at", oneWeekAgo.toISOString());

        // Count conversations started for this service in the last week
        const { count: conversationCount } = await supabase
          .from("conversations")
          .select("*", { count: "exact", head: true })
          .eq("service_id", boost.service_id)
          .gte("created_at", oneWeekAgo.toISOString());

        const expiresAt = new Date(boost.expires_at);
        const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

        stats.push({
          serviceId: boost.service_id,
          serviceTitle: service.title,
          views: viewCount || 0,
          interests: interestCount || 0,
          conversations: conversationCount || 0,
          daysRemaining,
          boostExpiresAt: boost.expires_at,
        });
      }

      if (stats.length === 0) continue;

      const unsubscribeToken = btoa(userId);
      const subject = `📊 Your Boost Report: ${stats.reduce((s, st) => s + st.views, 0)} views this week!`;
      const html = generateBoostStatsEmail(firstName, stats, unsubscribeToken);

      if (dryRun) {
        console.log(`[DRY RUN] Would send boost stats to ${profile.email} (${stats.length} listings)`);
        emailsSent++;
        continue;
      }

      try {
        const result = await sendEmail(profile.email, subject, html);
        console.log(`Boost stats sent to ${profile.email}:`, result);
        emailsSent++;
        await delay(1000);
      } catch (emailError) {
        console.error(`Failed to send boost stats to ${profile.email}:`, emailError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent: emailsSent }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-boost-stats:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
