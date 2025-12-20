import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MessageNotificationRequest {
  recipient_id: string;
  sender_name: string;
  message_preview: string;
  conversation_id: string;
  test_email?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipient_id, sender_name, message_preview, conversation_id, test_email }: MessageNotificationRequest = await req.json();

    console.log("Sending message notification, recipient:", recipient_id, "test_email:", test_email);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let recipientEmail: string;
    let recipientName: string;

    if (test_email) {
      recipientEmail = test_email;
      recipientName = "Test User";
      console.log("Using test email:", test_email);
    } else {
      // Check if user has message emails enabled
      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("message_emails_enabled")
        .eq("user_id", recipient_id)
        .maybeSingle();

      if (prefs?.message_emails_enabled === false) {
        console.log("User has disabled message email notifications:", recipient_id);
        return new Response(
          JSON.stringify({ success: false, message: "User has disabled message emails" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", recipient_id)
        .single();

      if (profileError || !profile?.email) {
        console.log("No email found for recipient:", recipient_id);
        return new Response(
          JSON.stringify({ success: false, message: "No email found for recipient" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      recipientEmail = profile.email;
      recipientName = profile.full_name || "there";
    }

    const truncatedMessage = message_preview.length > 100 
      ? message_preview.substring(0, 100) + "..." 
      : message_preview;

    const emailResponse = await resend.emails.send({
      from: "SwapSkills <hello@swap-skills.com>",
      to: [recipientEmail],
      subject: `New message from ${sender_name} on SwapSkills`,
      html: generateMessageEmail(recipientName, sender_name, truncatedMessage, conversation_id),
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending message notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

function generateMessageEmail(recipientName: string, senderName: string, message: string, conversationId: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Message on SwapSkills</title>
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
              <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #1f2937;">
                Hi ${recipientName}! 👋
              </h2>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                You have a new message from <strong style="color: #f97316;">${senderName}</strong>:
              </p>
              
              <div style="background: #faf8f5; padding: 24px; border-radius: 12px; border-left: 4px solid #f97316; margin: 24px 0;">
                <p style="margin: 0; font-size: 16px; color: #4b5563; font-style: italic; line-height: 1.6;">"${message}"</p>
              </div>
              
              <div style="text-align: center; margin-top: 32px;">
                <a href="https://swap-skills.com/messages/${conversationId}" 
                   style="background: #f97316; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);">
                  View Message →
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 32px; text-align: center; line-height: 1.6;">
                Don't miss out on potential skill swaps!<br>Log in to continue the conversation.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #faf8f5; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">
                <a href="https://swap-skills.com/profile" style="color: #f97316; text-decoration: none; font-weight: 500;">Manage Notifications</a>
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
