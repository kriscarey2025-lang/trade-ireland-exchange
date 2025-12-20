import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InterestNotificationRequest {
  service_owner_id: string;
  interested_user_id: string;
  service_id: string;
  service_title: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { service_owner_id, interested_user_id, service_id, service_title }: InterestNotificationRequest = await req.json();

    console.log("Sending interest notification to service owner:", service_owner_id);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user has interest emails enabled
    const { data: prefs } = await supabase
      .from("user_preferences")
      .select("interest_emails_enabled")
      .eq("user_id", service_owner_id)
      .maybeSingle();

    if (prefs?.interest_emails_enabled === false) {
      console.log("User has disabled interest email notifications:", service_owner_id);
      return new Response(
        JSON.stringify({ success: false, message: "User has disabled interest emails" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get service owner's email
    const { data: ownerProfile, error: ownerError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", service_owner_id)
      .single();

    if (ownerError || !ownerProfile?.email) {
      console.log("No email found for service owner:", service_owner_id);
      return new Response(
        JSON.stringify({ success: false, message: "No email found for service owner" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get interested user's profile
    const { data: interestedProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", interested_user_id)
      .single();

    const interestedUserName = interestedProfile?.full_name || "Someone";
    const ownerName = ownerProfile.full_name || "there";

    // Get services offered by the interested user
    const { data: userServices } = await supabase
      .from("services")
      .select("id, title, category")
      .eq("user_id", interested_user_id)
      .eq("status", "active")
      .limit(3);

    const emailResponse = await resend.emails.send({
      from: "SwapSkills <hello@swap-skills.com>",
      to: [ownerProfile.email],
      subject: `${interestedUserName} is interested in your skill: ${service_title}`,
      html: generateInterestEmail(ownerName, interestedUserName, service_title, service_id, userServices || []),
    });

    console.log("Interest notification email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending interest notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

function generateInterestEmail(
  ownerName: string, 
  interestedUserName: string, 
  serviceTitle: string, 
  serviceId: string,
  userServices: Array<{ id: string; title: string; category: string }>
): string {
  const servicesHtml = userServices.length > 0 
    ? `
      <div style="margin-top: 24px;">
        <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #1f2937;">
          Skills ${interestedUserName} can offer you:
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${userServices.map(s => `
            <a href="https://swap-skills.com/service/${s.id}" 
               style="display: inline-block; background: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 20px; text-decoration: none; font-size: 14px; font-weight: 500;">
              ${s.title}
            </a>
          `).join('')}
        </div>
      </div>
    `
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Someone is interested in your skill!</title>
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
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 48px;">💚</span>
              </div>
              
              <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #1f2937; text-align: center;">
                Great news, ${ownerName}!
              </h2>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.7; color: #4b5563; text-align: center;">
                <strong style="color: #f97316;">${interestedUserName}</strong> is interested in your skill swap:
              </p>
              
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0;">
                <p style="margin: 0; font-size: 20px; color: #92400e; font-weight: 600;">"${serviceTitle}"</p>
              </div>
              
              ${servicesHtml}
              
              <div style="text-align: center; margin-top: 32px;">
                <a href="https://swap-skills.com/service/${serviceId}" 
                   style="background: #f97316; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);">
                  View Your Listing →
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 32px; text-align: center; line-height: 1.6;">
                Check your profile to see all interested users and start a conversation!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #faf8f5; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">
                <a href="https://swap-skills.com/profile" style="color: #f97316; text-decoration: none; font-weight: 500;">View Interested Users</a>
                &nbsp;·&nbsp;
                <a href="https://swap-skills.com/unsubscribe" style="color: #6b7280; text-decoration: none;">Unsubscribe</a>
              </p>
              
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} SwapSkills Ireland. All rights reserved.<br>
                <a href="https://swap-skills.com/privacy" style="color: #9ca3af;">Privacy Policy</a> · 
                <a href="https://swap-skills.com/terms" style="color: #9ca3af;">Terms of Service</a>
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
