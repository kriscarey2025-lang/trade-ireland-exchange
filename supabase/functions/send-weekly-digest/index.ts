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
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting weekly digest job...");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users who have opted in for weekly digest
    const { data: subscribers, error: subscribersError } = await supabase
      .from("user_preferences")
      .select("user_id, skills_wanted, skills_wanted_custom")
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

    // Get new services from the past week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: newServices, error: servicesError } = await supabase
      .from("services")
      .select("id, title, description, category, location")
      .eq("type", "offer")
      .eq("status", "active")
      .gte("created_at", oneWeekAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(50);

    if (servicesError) {
      console.error("Error fetching new services:", servicesError);
      throw servicesError;
    }

    if (!newServices || newServices.length === 0) {
      console.log("No new services this week");
      return new Response(JSON.stringify({ success: true, sent: 0, reason: "no_new_services" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${newServices.length} new services this week`);

    let emailsSent = 0;

    for (const subscriber of subscribers as UserPreference[]) {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", subscriber.user_id)
        .single();

      if (profileError || !profile?.email) {
        console.log(`Skipping user ${subscriber.user_id}: no email`);
        continue;
      }

      // Match services to user's wanted skills
      const wantedSkills = [
        ...(subscriber.skills_wanted || []),
        ...(subscriber.skills_wanted_custom || []),
      ].map(s => s.toLowerCase());

      let matchingServices: Service[] = [];

      if (wantedSkills.length > 0) {
        matchingServices = (newServices as Service[]).filter(service => 
          wantedSkills.some(skill => 
            service.category.toLowerCase().includes(skill) ||
            skill.includes(service.category.toLowerCase()) ||
            service.title.toLowerCase().includes(skill) ||
            (service.description?.toLowerCase().includes(skill) ?? false)
          )
        );
      }

      // If no matches, show top 5 recent services
      const servicesToShow = matchingServices.length > 0 
        ? matchingServices.slice(0, 5) 
        : (newServices as Service[]).slice(0, 5);

      const firstName = profile.full_name?.split(" ")[0] || "there";
      const hasMatches = matchingServices.length > 0;

      // Send email
      try {
        await resend.emails.send({
          from: "Swap Skills <noreply@swap-skills.com>",
          to: [profile.email],
          subject: hasMatches 
            ? `🎯 ${matchingServices.length} new skill offers match your interests!` 
            : "📬 Your Weekly Swap Skills Digest",
          html: generateDigestEmail(firstName, servicesToShow, hasMatches, newServices.length),
        });

        emailsSent++;
        console.log(`Email sent to ${profile.email}`);

        // Update last_digest_sent_at
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
  hasMatches: boolean,
  totalNewServices: number
): string {
  const servicesList = services.map(service => `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #3d3d4a;">
        <a href="https://swap-skills.com/service/${service.id}" style="text-decoration: none;">
          <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #ffffff;">${service.title}</h4>
        </a>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #a1a1aa; line-height: 1.5;">
          ${service.description ? (service.description.length > 120 ? service.description.slice(0, 120) + '...' : service.description) : 'No description'}
        </p>
        <div style="display: flex; gap: 12px;">
          <span style="font-size: 12px; color: #7c3aed; background: rgba(124, 58, 237, 0.15); padding: 4px 10px; border-radius: 12px;">${service.category}</span>
          ${service.location ? `<span style="font-size: 12px; color: #71717a;">📍 ${service.location}</span>` : ''}
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
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #2d2d3a;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #2d2d3a; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">
          
          <!-- Header with purple gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6366f1 100%); padding: 48px 40px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                🔄 Swap Skills
              </h1>
              <p style="margin: 12px 0 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.85);">
                Weekly Digest
              </p>
            </td>
          </tr>
          
          <!-- Main content -->
          <tr>
            <td style="padding: 48px 40px;">
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #ffffff;">
                Hi ${firstName}! 👋
              </h2>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #a1a1aa;">
                ${hasMatches 
                  ? `Great news! We found <strong style="color: #8b5cf6;">${services.length} new skill offers</strong> that match what you're looking for.`
                  : `Here's what's new on Swap Skills this week. We had <strong style="color: #8b5cf6;">${totalNewServices} new skill offers</strong> posted!`
                }
              </p>
              
              <div style="background-color: #3d3d4a; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #ffffff;">
                  ${hasMatches ? '🎯 Matching Offers' : '✨ Featured This Week'}
                </h3>
                
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  ${servicesList}
                </table>
              </div>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://swap-skills.com/browse" style="display: inline-block; background: #7c3aed; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
                  Browse All Offers →
                </a>
              </div>
              
              <p style="margin: 32px 0 0 0; font-size: 14px; color: #71717a; text-align: center;">
                You're receiving this email because you've opted in to weekly updates.<br>
                <a href="https://swap-skills.com/profile" style="color: #8b5cf6; text-decoration: underline;">Manage your preferences</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #252532; padding: 32px 40px; text-align: center; border-top: 1px solid #3d3d4a;">
              <p style="margin: 0; font-size: 12px; color: #52525b;">
                © ${new Date().getFullYear()} Swap Skills. All rights reserved.<br>
                <a href="https://swap-skills.com/privacy" style="color: #71717a;">Privacy Policy</a> · 
                <a href="https://swap-skills.com/terms" style="color: #71717a;">Terms of Service</a>
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
