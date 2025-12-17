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

interface UserPreference {
  user_id: string;
  skills_wanted: string[] | null;
  skills_wanted_custom: string[] | null;
  weekly_digest_enabled: boolean;
}

interface Profile {
  email: string | null;
  full_name: string | null;
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
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting weekly digest job...");

    let testEmail: string | null = null;
    try {
      const body: RequestBody = await req.json();
      testEmail = body.test_email || null;
    } catch {
      // No body or invalid JSON, continue normally
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

    if (servicesError) {
      console.error("Error fetching new services:", servicesError);
      throw servicesError;
    }

    const { data: newCommunityPosts, error: communityError } = await supabase
      .from("community_posts")
      .select("id, title, description, category, location, county")
      .eq("status", "active")
      .eq("moderation_status", "approved")
      .eq("is_visible", true)
      .gte("created_at", oneWeekAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(20);

    if (communityError) {
      console.error("Error fetching community posts:", communityError);
      throw communityError;
    }

    if (testEmail) {
      console.log("Sending test digest to:", testEmail);
      
      const servicesToShow = (newServices as Service[] || []).slice(0, 5);
      const communityPostsToShow = (newCommunityPosts as CommunityPost[] || []).slice(0, 5);
      const unsubscribeToken = btoa("test-user");

      try {
        await resend.emails.send({
          from: "Swap Skills <noreply@swap-skills.com>",
          to: [testEmail],
          subject: "📬 Your Weekly Swap Skills Digest (TEST)",
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

        console.log("Test email sent to:", testEmail);
        return new Response(JSON.stringify({ success: true, sent: 1, test: true }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      } catch (emailError) {
        console.error("Failed to send test email:", emailError);
        return new Response(JSON.stringify({ success: false, error: String(emailError) }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    const { data: subscribers, error: subscribersError } = await supabase
      .from("user_preferences")
      .select("user_id, skills_wanted, skills_wanted_custom, weekly_digest_enabled")
      .eq("weekly_digest_enabled", true);

    if (subscribersError) {
      console.error("Error fetching subscribers:", subscribersError);
      throw subscribersError;
    }

    if (!subscribers || subscribers.length === 0) {
      console.log("No subscribers found for weekly digest");
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${subscribers.length} subscribers`);

    const hasContent = (newServices && newServices.length > 0) || (newCommunityPosts && newCommunityPosts.length > 0);

    if (!hasContent) {
      console.log("No new content this week");
      return new Response(JSON.stringify({ success: true, sent: 0, reason: "no_new_content" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${newServices?.length || 0} new services and ${newCommunityPosts?.length || 0} community posts this week`);

    let emailsSent = 0;

    for (const subscriber of subscribers as UserPreference[]) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", subscriber.user_id)
        .single();

      if (profileError || !profile?.email) {
        console.log(`Skipping user ${subscriber.user_id}: no email`);
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

      try {
        await resend.emails.send({
          from: "Swap Skills <noreply@swap-skills.com>",
          to: [profile.email],
          subject: hasMatches 
            ? `🎯 ${matchingServices.length} new skill offers match your interests!` 
            : "📬 Your Weekly Swap Skills Digest",
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

        emailsSent++;
        console.log(`Email sent to ${profile.email}`);

        await supabase
          .from("user_preferences")
          .update({ last_digest_sent_at: new Date().toISOString() })
          .eq("user_id", subscriber.user_id);

      } catch (emailError) {
        console.error(`Failed to send email to ${profile.email}:`, emailError);
      }
    }

    console.log(`Weekly digest complete: ${emailsSent} emails sent`);

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
      <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
        <a href="https://swap-skills.com/services/${service.id}" style="text-decoration: none;">
          <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${service.title}</h4>
        </a>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; line-height: 1.5;">
          ${service.description ? (service.description.length > 120 ? service.description.slice(0, 120) + '...' : service.description) : 'No description'}
        </p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <span style="font-size: 12px; color: #ffffff; background: ${service.type === 'offer' ? '#22c55e' : '#f97316'}; padding: 4px 10px; border-radius: 12px;">${service.type === 'offer' ? 'Offer' : 'Request'}</span>
          <span style="font-size: 12px; color: #065f46; background: #ecfdf5; padding: 4px 10px; border-radius: 12px;">${service.category}</span>
          ${service.location ? `<span style="font-size: 12px; color: #6b7280;">📍 ${service.location}</span>` : ''}
        </div>
      </td>
    </tr>
  `).join('');

  const communityPostsList = communityPosts.map(post => `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
        <a href="https://swap-skills.com/community" style="text-decoration: none;">
          <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${post.title}</h4>
        </a>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; line-height: 1.5;">
          ${post.description ? (post.description.length > 120 ? post.description.slice(0, 120) + '...' : post.description) : 'No description'}
        </p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <span style="font-size: 12px; color: #c2410c; background: #fff7ed; padding: 4px 10px; border-radius: 12px;">${post.category}</span>
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
  <title>Your Weekly Swap Skills Digest</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #ffffff; padding: 48px 40px; text-align: center; border-bottom: 3px solid #065f46;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #065f46; letter-spacing: -0.5px;">
                🤝 Swap Skills
              </h1>
              <p style="margin: 12px 0 0 0; font-size: 16px; color: #6b7280;">
                Weekly Digest
              </p>
            </td>
          </tr>
          
          <!-- Main content -->
          <tr>
            <td style="padding: 48px 40px; background-color: #ffffff;">
              <h2 style="margin: 0 0 16px 0; font-size: 26px; font-weight: 700; color: #1f2937;">
                Hi ${firstName}! 👋
              </h2>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                Here's what's been happening on Swap Skills this week:
                ${totalNewServices > 0 ? `<br>• <strong style="color: #065f46;">${totalNewServices} new skill listings</strong> posted` : ''}
                ${totalNewPosts > 0 ? `<br>• <strong style="color: #c2410c;">${totalNewPosts} new community posts</strong> added` : ''}
              </p>
              
              ${services.length > 0 ? `
              <!-- Services Section -->
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #e5e7eb;">
                <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #1f2937;">
                  ${hasMatches ? '🎯 Matching Skill Listings' : '✨ Featured Skill Listings'}
                </h3>
                
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  ${servicesList}
                </table>
                
                <div style="text-align: center; margin-top: 20px;">
                  <a href="https://swap-skills.com/browse" style="display: inline-block; background: #065f46; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                    Browse All Listings →
                  </a>
                </div>
              </div>
              ` : ''}
              
              ${communityPosts.length > 0 ? `
              <!-- Community Board Section -->
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #e5e7eb;">
                <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #1f2937;">
                  📋 Community Board Updates
                </h3>
                
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  ${communityPostsList}
                </table>
                
                <div style="text-align: center; margin-top: 20px;">
                  <a href="https://swap-skills.com/community" style="display: inline-block; background: #c2410c; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                    View Community Board →
                  </a>
                </div>
              </div>
              ` : ''}
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">
                You're receiving this email because you've opted in to weekly updates.
              </p>
              
              <p style="margin: 0 0 16px 0;">
                <a href="https://swap-skills.com/profile" style="color: #065f46; text-decoration: none; font-weight: 500; font-size: 14px;">Manage Preferences</a>
                &nbsp;·&nbsp;
                <a href="https://swap-skills.com/unsubscribe?token=${unsubscribeToken}" style="color: #ef4444; text-decoration: none; font-weight: 500; font-size: 14px;">Unsubscribe from Digest</a>
              </p>
              
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} Swap Skills. All rights reserved.<br>
                <a href="https://swap-skills.com/privacy" style="color: #6b7280;">Privacy Policy</a> · 
                <a href="https://swap-skills.com/terms" style="color: #6b7280;">Terms of Service</a>
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
