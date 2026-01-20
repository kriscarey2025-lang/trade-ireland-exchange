import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SwapSkills brand colors
const brandColors = {
  primary: "#16a34a", // Green
  primaryLight: "#22c55e",
  background: "#fafaf9",
  text: "#1c1917",
  muted: "#78716c",
  accent: "#f97316", // Orange accent
};

// Send email using Resend API directly
async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "SwapSkills <hello@swap-skills.com>",
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

const generateNudgeEmail = (
  userName: string,
  serviceTitle: string,
  providerName: string,
  serviceId: string
) => {
  const baseUrl = "https://swap-skills.com";
  const serviceUrl = `${baseUrl}/services/${serviceId}`;
  const messagesUrl = `${baseUrl}/messages`;
  
  // Fun, friendly subject lines
  const subjectLines = [
    `🍀 ${providerName} is waiting to hear from you!`,
    `👋 Don't be shy! ${providerName} would love to swap skills`,
    `🌟 That skill swap you were eyeing? Still available!`,
    `💚 ${providerName}'s ${serviceTitle} caught your eye...`,
  ];
  const subject = subjectLines[Math.floor(Math.random() * subjectLines.length)];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: ${brandColors.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with logo -->
          <tr>
            <td style="background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.primaryLight} 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                🍀 SwapSkills
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Ireland's Skill-Swapping Community
              </p>
            </td>
          </tr>
          
          <!-- Main content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: ${brandColors.text}; font-size: 24px; font-weight: 600;">
                Hey ${userName}! 👋
              </h2>
              
              <p style="margin: 0 0 20px 0; color: ${brandColors.text}; font-size: 16px; line-height: 1.6;">
                We noticed you were checking out <strong style="color: ${brandColors.primary};">"${serviceTitle}"</strong> by ${providerName}. 
                Great taste! 🎯
              </p>
              
              <p style="margin: 0 0 20px 0; color: ${brandColors.text}; font-size: 16px; line-height: 1.6;">
                Here's a little secret: <strong>${providerName} is probably just as nervous about making the first move as you are!</strong> 
                That's the beauty of SwapSkills – everyone's here to help each other out.
              </p>
              
              <!-- Fun quote box -->
              <table role="presentation" style="width: 100%; margin: 25px 0;">
                <tr>
                  <td style="background-color: #f0fdf4; border-left: 4px solid ${brandColors.primary}; padding: 20px; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; color: ${brandColors.text}; font-size: 15px; font-style: italic;">
                      "The first message doesn't have to be perfect – just say hi! 
                      Something like 'Hey, I love what you're offering!' works brilliantly." 
                    </p>
                    <p style="margin: 10px 0 0 0; color: ${brandColors.muted}; font-size: 13px;">
                      – Every successful swap starts with a simple hello 💚
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 30px 0; color: ${brandColors.text}; font-size: 16px; line-height: 1.6;">
                Go on, take the leap! What's the worst that could happen? 
                (Spoiler: You might just make a new friend AND learn something amazing 🚀)
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${serviceUrl}" 
                       style="display: inline-block; background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.primaryLight} 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.4);">
                      💬 Say Hello to ${providerName}
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Secondary link -->
              <p style="margin: 25px 0 0 0; text-align: center; color: ${brandColors.muted}; font-size: 14px;">
                Or <a href="${messagesUrl}" style="color: ${brandColors.primary}; text-decoration: underline;">check out your messages</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafaf9; padding: 25px 40px; border-top: 1px solid #e7e5e4;">
              <p style="margin: 0 0 10px 0; color: ${brandColors.muted}; font-size: 13px; text-align: center;">
                🍀 SwapSkills – Where skills meet community
              </p>
              <p style="margin: 0; color: ${brandColors.muted}; font-size: 12px; text-align: center;">
                <a href="${baseUrl}/unsubscribe" style="color: ${brandColors.muted}; text-decoration: underline;">Unsubscribe</a> · 
                <a href="${baseUrl}/privacy" style="color: ${brandColors.muted}; text-decoration: underline;">Privacy</a> · 
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

  return { subject, html };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Find users who viewed a service 24+ hours ago but haven't contacted or been nudged
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: pendingNudges, error: fetchError } = await supabaseAdmin
      .from("browse_nudges")
      .select("id, user_id, service_id, service_title, provider_name, viewed_at")
      .is("nudge_sent_at", null)
      .is("contacted_at", null)
      .lt("viewed_at", twentyFourHoursAgo)
      .limit(50);

    if (fetchError) {
      throw new Error(`Failed to fetch pending nudges: ${fetchError.message}`);
    }

    if (!pendingNudges || pendingNudges.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending nudges to send", count: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Group nudges by user - only send ONE email per user (pick the most recent service viewed)
    const userNudgeMap = new Map<string, typeof pendingNudges[0]>();
    for (const nudge of pendingNudges) {
      const existing = userNudgeMap.get(nudge.user_id);
      if (!existing || new Date(nudge.viewed_at) > new Date(existing.viewed_at)) {
        userNudgeMap.set(nudge.user_id, nudge);
      }
    }
    
    const uniqueUserNudges = Array.from(userNudgeMap.values());
    console.log(`Found ${pendingNudges.length} pending nudges, ${uniqueUserNudges.length} unique users to process`);

    let sentCount = 0;
    const errors: string[] = [];
    
    // Helper to add delay between emails (Resend allows 2/second, we do 1/second to be safe)
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (const nudge of uniqueUserNudges) {
      try {
        // Get user's email and name
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("email, full_name")
          .eq("id", nudge.user_id)
          .single();

        if (!profile?.email) {
          console.log(`No email for user ${nudge.user_id}, skipping`);
          continue;
        }

        // Check user preferences - respect email opt-out
        const { data: prefs } = await supabaseAdmin
          .from("user_preferences")
          .select("interest_emails_enabled")
          .eq("user_id", nudge.user_id)
          .single();

        if (prefs?.interest_emails_enabled === false) {
          console.log(`User ${nudge.user_id} has opted out of interest emails, skipping`);
          // Mark ALL nudges for this user as sent so we don't keep trying
          await supabaseAdmin
            .from("browse_nudges")
            .update({ nudge_sent_at: new Date().toISOString() })
            .eq("user_id", nudge.user_id)
            .is("nudge_sent_at", null);
          continue;
        }

        const userName = profile.full_name?.split(" ")[0] || "there";
        const providerName = nudge.provider_name?.split(" ")[0] || "them";

        const { subject, html } = generateNudgeEmail(
          userName,
          nudge.service_title,
          providerName,
          nudge.service_id
        );

        const emailResponse = await sendEmail(profile.email, subject, html);
        console.log(`Nudge email sent to ${profile.email}:`, emailResponse);

        // Mark ALL nudges for this user as sent
        await supabaseAdmin
          .from("browse_nudges")
          .update({ nudge_sent_at: new Date().toISOString() })
          .eq("user_id", nudge.user_id)
          .is("nudge_sent_at", null);

        sentCount++;
        
        // Rate limit: wait 600ms between emails to stay under Resend's 2/second limit
        await delay(600);
      } catch (emailError: any) {
        console.error(`Failed to send nudge ${nudge.id}:`, emailError);
        errors.push(`${nudge.id}: ${emailError.message}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Sent ${sentCount} nudge emails`, 
        count: sentCount,
        errors: errors.length > 0 ? errors : undefined 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-browse-nudge function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
