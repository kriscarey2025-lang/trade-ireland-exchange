import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SkillTradeNotificationRequest {
  recipient_id: string;
  sender_id: string;
  conversation_id: string;
  notification_type: 'initiated' | 'accepted' | 'counter_proposal';
  proposed_date: string;
  service_title?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      recipient_id, 
      sender_id, 
      conversation_id, 
      notification_type, 
      proposed_date,
      service_title 
    }: SkillTradeNotificationRequest = await req.json();

    console.log(`Sending skill trade notification (${notification_type}) to:`, recipient_id);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get recipient's email and preferences
    const { data: recipientProfile, error: recipientError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", recipient_id)
      .single();

    if (recipientError || !recipientProfile?.email) {
      console.log("No email found for recipient:", recipient_id);
      return new Response(
        JSON.stringify({ success: false, message: "No email found for recipient" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get sender's profile
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", sender_id)
      .single();

    // Format name as "FirstName L." for privacy
    const formatDisplayName = (fullName: string | null): string => {
      if (!fullName) return "Someone";
      const parts = fullName.trim().split(/\s+/);
      if (parts.length === 1) return parts[0];
      const firstName = parts[0];
      const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
      return `${firstName} ${lastInitial}.`;
    };

    const senderName = formatDisplayName(senderProfile?.full_name);
    const recipientName = recipientProfile.full_name?.split(' ')[0] || "there";

    // Format the date nicely
    const formattedDate = new Date(proposed_date).toLocaleDateString('en-IE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Determine email content based on notification type
    let subject: string;
    let headline: string;
    let message: string;
    let emoji: string;
    let ctaText: string;

    switch (notification_type) {
      case 'initiated':
        subject = `${senderName} wants to swap skills with you!`;
        headline = `Skill Trade Request`;
        message = `<strong style="color: #f97316;">${senderName}</strong> wants to exchange skills${service_title ? ` for "${service_title}"` : ''} with you and has proposed a completion date of <strong>${formattedDate}</strong>.`;
        emoji = "🤝";
        ctaText = "View & Respond";
        break;
      case 'accepted':
        subject = `${senderName} accepted your skill trade!`;
        headline = `Trade Accepted!`;
        message = `Great news! <strong style="color: #f97316;">${senderName}</strong> has accepted your skill trade request${service_title ? ` for "${service_title}"` : ''}. The exchange is now in progress with a completion date of <strong>${formattedDate}</strong>.`;
        emoji = "✅";
        ctaText = "View Exchange";
        break;
      case 'counter_proposal':
        subject = `${senderName} proposed a different date`;
        headline = `New Date Proposed`;
        message = `<strong style="color: #f97316;">${senderName}</strong> would like to suggest a different completion date for your skill trade${service_title ? ` for "${service_title}"` : ''}: <strong>${formattedDate}</strong>.`;
        emoji = "📅";
        ctaText = "Review Proposal";
        break;
      default:
        throw new Error(`Unknown notification type: ${notification_type}`);
    }

    const emailResponse = await resend.emails.send({
      from: "SwapSkills <hello@swap-skills.com>",
      to: [recipientProfile.email],
      subject,
      html: generateSkillTradeEmail(
        recipientName,
        senderName,
        headline,
        message,
        emoji,
        ctaText,
        conversation_id,
        notification_type
      ),
    });

    console.log("Skill trade notification email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending skill trade notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

function generateSkillTradeEmail(
  recipientName: string,
  senderName: string,
  headline: string,
  message: string,
  emoji: string,
  ctaText: string,
  conversationId: string,
  notificationType: string
): string {
  const isAccepted = notificationType === 'accepted';
  const headerColor = isAccepted ? '#22c55e' : '#f97316';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #faf8f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #fffefa; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #fffefa; padding: 40px 40px 24px 40px; text-align: center; border-bottom: 2px solid ${headerColor};">
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
                <span style="font-size: 48px;">${emoji}</span>
              </div>
              
              <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #1f2937; text-align: center;">
                ${headline}
              </h2>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.7; color: #4b5563; text-align: center;">
                Hi ${recipientName}!
              </p>
              
              <div style="background: linear-gradient(135deg, ${isAccepted ? '#dcfce7' : '#fef3c7'} 0%, ${isAccepted ? '#bbf7d0' : '#fde68a'} 100%); padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0;">
                <p style="margin: 0; font-size: 16px; color: ${isAccepted ? '#166534' : '#92400e'}; line-height: 1.6;">
                  ${message}
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 32px;">
                <a href="https://swap-skills.com/messages/${conversationId}" 
                   style="background: ${headerColor}; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);">
                  ${ctaText} →
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 32px; text-align: center; line-height: 1.6;">
                ${notificationType === 'initiated' 
                  ? 'Review the request and accept the proposed date, or suggest an alternative that works better for you.'
                  : notificationType === 'accepted'
                  ? 'Your skill exchange is now in progress. Complete it by the agreed date and leave a review!'
                  : 'Review the new proposed date and accept or suggest an alternative.'
                }
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #faf8f5; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">
                <a href="https://swap-skills.com/messages" style="color: #f97316; text-decoration: none; font-weight: 500;">View All Messages</a>
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
