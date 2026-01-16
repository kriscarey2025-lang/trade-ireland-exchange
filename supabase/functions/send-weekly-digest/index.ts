import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const baseUrl = "https://swap-skills.com";

interface UserPreference {
  user_id: string;
  skills_wanted: string[] | null;
  skills_wanted_custom: string[] | null;
  weekly_digest_enabled: boolean;
}

interface Service {
  id: string;
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  type: string;
}

interface CommunityPost {
  id: string;
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  county: string | null;
}

interface RequestBody {
  test_email?: string;
  dry_run?: boolean; // If true, logs what would be sent but doesn't actually send
  only_emails?: string[]; // If provided, only send to these specific email addresses
  exclude_emails?: string[]; // If provided, exclude these email addresses
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting weekly digest job...");

    let testEmail: string | null = null;
    let dryRun = false;
    let onlyEmails: string[] | null = null;
    let excludeEmails: string[] | null = null;
    try {
      const body: RequestBody = await req.json();
      testEmail = body.test_email || null;
      dryRun = body.dry_run || false;
      onlyEmails = body.only_emails || null;
      excludeEmails = body.exclude_emails || null;
    } catch {
      // No body or invalid JSON
    }

    if (dryRun) {
      console.log("🧪 DRY RUN MODE - No emails will actually be sent");
    }
    
    if (onlyEmails && onlyEmails.length > 0) {
      console.log(`📧 TARGETED MODE - Only sending to: ${onlyEmails.join(", ")}`);
    }
    
    if (excludeEmails && excludeEmails.length > 0) {
      console.log(`🚫 EXCLUSION MODE - Excluding: ${excludeEmails.join(", ")}`);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: newServices, error: servicesError } = await supabase
      .from("services")
      .select("id, title, description, category, location, type")
      .eq("status", "active")
      .eq("moderation_status", "approved")
      .gte("created_at", oneWeekAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(50);

    if (servicesError) throw servicesError;

    const { data: newCommunityPosts, error: communityError } = await supabase
      .from("community_posts")
      .select("id, title, description, category, location, county")
      .eq("status", "active")
      .eq("moderation_status", "approved")
      .eq("is_visible", true)
      .gte("created_at", oneWeekAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(20);

    if (communityError) throw communityError;

    if (testEmail) {
      console.log("Sending test digest to:", testEmail);
      
      const servicesToShow = (newServices as Service[] || []).slice(0, 5);
      const communityPostsToShow = (newCommunityPosts as CommunityPost[] || []).slice(0, 5);
      const unsubscribeToken = btoa("test-user");

      try {
        await resend.emails.send({
          from: "SwapSkills <hello@swap-skills.com>",
          to: [testEmail],
          subject: "📬 Your Weekly SwapSkills Digest (TEST)",
          html: generateDigestEmail(
            "Test User", 
            servicesToShow, 
            communityPostsToShow,
            false, 
            newServices?.length || 0,
            newCommunityPosts?.length || 0,
            unsubscribeToken
          ),
        });

        return new Response(JSON.stringify({ success: true, sent: 1, test: true }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      } catch (emailError) {
        return new Response(JSON.stringify({ success: false, error: String(emailError) }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    // Calculate 24 hours ago for duplicate prevention
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Only fetch subscribers who haven't received a digest in the last 24 hours
    const { data: subscribers, error: subscribersError } = await supabase
      .from("user_preferences")
      .select("user_id, skills_wanted, skills_wanted_custom, weekly_digest_enabled, last_digest_sent_at")
      .eq("weekly_digest_enabled", true)
      .or(`last_digest_sent_at.is.null,last_digest_sent_at.lt.${twentyFourHoursAgo.toISOString()}`);

    if (subscribersError) throw subscribersError;

    console.log(`Found ${subscribers?.length || 0} eligible subscribers (not sent in last 24h)`);

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, reason: "no_eligible_subscribers" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const hasContent = (newServices && newServices.length > 0) || (newCommunityPosts && newCommunityPosts.length > 0);

    if (!hasContent) {
      return new Response(JSON.stringify({ success: true, sent: 0, reason: "no_new_content" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let emailsSent = 0;
    
    // Helper to delay between emails (Resend rate limit: 2/second, so we use 1 second for safety)
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (const subscriber of subscribers as UserPreference[]) {
      // Simply update the timestamp - the SELECT already filtered eligible users
      // The 24-hour check in the initial query prevents duplicates
      const sendTimestamp = new Date().toISOString();
      const { error: lockError } = await supabase
        .from("user_preferences")
        .update({ last_digest_sent_at: sendTimestamp })
        .eq("user_id", subscriber.user_id);

      if (lockError) {
        console.log(`Failed to update timestamp for ${subscriber.user_id}:`, lockError);
        continue;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", subscriber.user_id)
        .single();

      if (profileError || !profile?.email) {
        console.log(`Skipping ${subscriber.user_id} - no email found`);
        continue;
      }

      // If only_emails is specified, skip users not in that list
      if (onlyEmails && onlyEmails.length > 0 && !onlyEmails.includes(profile.email)) {
        continue;
      }

      // If exclude_emails is specified, skip users in that list
      if (excludeEmails && excludeEmails.length > 0 && excludeEmails.includes(profile.email.toLowerCase())) {
        console.log(`Skipping ${profile.email} - in exclusion list`);
        continue;
      }

      const wantedSkills = [
        ...(subscriber.skills_wanted || []),
        ...(subscriber.skills_wanted_custom || []),
      ].map(s => s.toLowerCase());

      let matchingServices: Service[] = [];

      if (wantedSkills.length > 0 && newServices) {
        matchingServices = (newServices as Service[]).filter(service => 
          wantedSkills.some(skill => 
            service.category.toLowerCase().includes(skill) ||
            skill.includes(service.category.toLowerCase()) ||
            service.title.toLowerCase().includes(skill) ||
            (service.description?.toLowerCase().includes(skill) ?? false)
          )
        );
      }

      const servicesToShow = matchingServices.length > 0 
        ? matchingServices.slice(0, 5) 
        : (newServices as Service[] || []).slice(0, 5);

      const communityPostsToShow = (newCommunityPosts as CommunityPost[] || []).slice(0, 5);

      const firstName = profile.full_name?.split(" ")[0] || "there";
      const hasMatches = matchingServices.length > 0;
      const unsubscribeToken = btoa(subscriber.user_id);

      // DRY RUN: Just log what would be sent
      if (dryRun) {
        console.log(`[DRY RUN] Would send digest to ${profile.email} (${firstName}), matches: ${hasMatches ? matchingServices.length : 0}`);
        emailsSent++;
        continue;
      }

      try {
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: "SwapSkills <hello@swap-skills.com>",
          to: [profile.email],
          subject: hasMatches 
            ? `🎯 ${matchingServices.length} new skill offers match your interests!` 
            : "📬 Your Weekly SwapSkills Digest",
          html: generateDigestEmail(
            firstName, 
            servicesToShow, 
            communityPostsToShow,
            hasMatches, 
            newServices?.length || 0,
            newCommunityPosts?.length || 0,
            unsubscribeToken
          ),
        });

        if (emailError) {
          console.error(`Resend API error for ${profile.email}:`, JSON.stringify(emailError));
          continue;
        }

        emailsSent++;
        console.log(`Successfully sent digest to ${profile.email} (id: ${emailData?.id})`);
        
        // Wait 1 second AFTER sending to respect Resend's 2 req/sec rate limit
        await delay(1000);

      } catch (emailError) {
        console.error(`Failed to send email to ${profile.email}:`, emailError);
        // Note: We don't rollback the timestamp - better to miss one email than send duplicates
        // The user will receive the next weekly digest
      }
    }

    return new Response(JSON.stringify({ success: true, sent: emailsSent }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-weekly-digest function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateDigestEmail(
  firstName: string, 
  services: Service[], 
  communityPosts: CommunityPost[],
  hasMatches: boolean,
  totalNewServices: number,
  totalNewPosts: number,
  unsubscribeToken: string
): string {
  const servicesList = services.map(service => `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #f0ebe3;">
        <a href="${baseUrl}/services/${service.id}" style="text-decoration: none;">
          <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${service.title}</h4>
        </a>
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; line-height: 1.5;">
          ${service.description ? (service.description.length > 120 ? service.description.slice(0, 120) + '...' : service.description) : 'No description'}
        </p>
        <div>
          <span style="font-size: 12px; color: #ffffff; background: ${service.type === 'offer' ? '#4d7c0f' : '#f97316'}; padding: 4px 12px; border-radius: 20px; display: inline-block; margin-right: 8px;">${service.type === 'offer' ? '✨ Offer' : '🔍 Request'}</span>
          <span style="font-size: 12px; color: #4d7c0f; background: #ecfccb; padding: 4px 12px; border-radius: 20px; display: inline-block; margin-right: 8px;">${service.category}</span>
          ${service.location ? `<span style="font-size: 12px; color: #6b7280;">📍 ${service.location}</span>` : ''}
        </div>
      </td>
    </tr>
  `).join('');

  const communityPostsList = communityPosts.map(post => `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #f0ebe3;">
        <a href="${baseUrl}/community" style="text-decoration: none;">
          <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${post.title}</h4>
        </a>
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; line-height: 1.5;">
          ${post.description ? (post.description.length > 120 ? post.description.slice(0, 120) + '...' : post.description) : 'No description'}
        </p>
        <div>
          <span style="font-size: 12px; color: #c2410c; background: #fff7ed; padding: 4px 12px; border-radius: 20px; display: inline-block; margin-right: 8px;">${post.category}</span>
          ${post.county ? `<span style="font-size: 12px; color: #6b7280;">📍 ${post.county}</span>` : ''}
        </div>
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly SwapSkills Digest</title>
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
                Here's what's been happening in our wee corner of the internet this week:
              </p>
              
              <!-- Stats -->
              <div style="background: #faf8f5; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
                ${totalNewServices > 0 ? `<span style="display: inline-block; margin: 0 16px; font-size: 14px;"><strong style="color: #4d7c0f; font-size: 24px;">${totalNewServices}</strong><br><span style="color: #6b7280;">new skills</span></span>` : ''}
                ${totalNewPosts > 0 ? `<span style="display: inline-block; margin: 0 16px; font-size: 14px;"><strong style="color: #f97316; font-size: 24px;">${totalNewPosts}</strong><br><span style="color: #6b7280;">community posts</span></span>` : ''}
              </div>
              
              ${services.length > 0 ? `
              <!-- Services Section -->
              <div style="background-color: #faf8f5; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #1f2937;">
                  ${hasMatches ? '🎯 Matching Your Interests' : '✨ Featured Skills'}
                </h3>
                
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  ${servicesList}
                </table>
                
                <div style="text-align: center; margin-top: 24px;">
                  <a href="${baseUrl}/browse" style="display: inline-block; background: #f97316; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);">
                    See what's on offer →
                  </a>
                </div>
              </div>
              ` : ''}
              
              ${communityPosts.length > 0 ? `
              <!-- Community Board Section -->
              <div style="background-color: #faf8f5; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #1f2937;">
                  📋 Community Board
                </h3>
                
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  ${communityPostsList}
                </table>
                
                <div style="text-align: center; margin-top: 24px;">
                  <a href="${baseUrl}/community" style="display: inline-block; background: transparent; color: #f97316; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; border: 2px solid #f97316;">
                    View Community Board →
                  </a>
                </div>
              </div>
              ` : ''}
              
              <!-- Quote Section -->
              <div style="background: #fffefa; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: center; border: 1px solid #f0ebe3;">
                <p style="margin: 0; font-size: 14px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">Imagine this...</p>
                <p style="margin: 12px 0 0 0; font-size: 16px; color: #4b5563; font-style: italic; line-height: 1.6;">
                  "I taught Mary's kids piano, and she sorted my garden. We've become great friends — <strong>and neither of us spent a penny.</strong>"
                </p>
                <p style="margin: 12px 0 0 0; font-size: 14px; color: #f97316;">— The kind of story we're building</p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #faf8f5; padding: 32px 40px; text-align: center; border-top: 1px solid #f0ebe3;">
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">
                You're receiving this because you opted in to weekly updates.
              </p>
              
              <p style="margin: 0 0 16px 0;">
                <a href="${baseUrl}/profile" style="color: #f97316; text-decoration: none; font-weight: 500; font-size: 14px;">Manage Preferences</a>
                &nbsp;·&nbsp;
                <a href="${baseUrl}/unsubscribe?token=${unsubscribeToken}" style="color: #6b7280; text-decoration: none; font-size: 14px;">Unsubscribe</a>
              </p>
              
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} SwapSkills Ireland. All rights reserved.<br>
                <a href="${baseUrl}/privacy" style="color: #9ca3af;">Privacy Policy</a> · 
                <a href="${baseUrl}/terms" style="color: #9ca3af;">Terms of Service</a>
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

serve(handler);
