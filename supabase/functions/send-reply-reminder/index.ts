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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting reply reminder job...");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find conversations where last message is >48h old and unread
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    // Get all conversations with unread messages older than 48h
    const { data: unreadMessages, error: msgError } = await supabase
      .from("messages")
      .select("id, conversation_id, sender_id, content, created_at")
      .eq("read", false)
      .lt("created_at", cutoff)
      .order("created_at", { ascending: false });

    if (msgError) throw msgError;
    if (!unreadMessages || unreadMessages.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, reason: "no_unread" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Deduplicate by conversation - only remind once per conversation
    const seenConversations = new Set<string>();
    const uniqueReminders: typeof unreadMessages = [];
    
    for (const msg of unreadMessages) {
      if (!seenConversations.has(msg.conversation_id)) {
        seenConversations.add(msg.conversation_id);
        uniqueReminders.push(msg);
      }
    }

    let emailsSent = 0;
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (const msg of uniqueReminders) {
      // Get conversation to find recipient
      const { data: conv } = await supabase
        .from("conversations")
        .select("participant_1, participant_2")
        .eq("id", msg.conversation_id)
        .single();

      if (!conv) continue;

      const recipientId = conv.participant_1 === msg.sender_id
        ? conv.participant_2
        : conv.participant_1;

      // Get recipient profile
      const { data: recipient } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", recipientId)
        .single();

      if (!recipient?.email) continue;

      // Check user hasn't opted out of message emails
      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("message_emails_enabled, weekly_digest_enabled")
        .eq("user_id", recipientId)
        .maybeSingle();

      if (prefs?.message_emails_enabled === false || prefs?.weekly_digest_enabled === false) continue;

      // Get sender name
      const { data: sender } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", msg.sender_id)
        .single();

      const senderName = sender?.full_name?.split(" ")[0] || "Someone";
      const recipientName = recipient.full_name?.split(" ")[0] || "there";

      try {
        await resend.emails.send({
          from: "SwapSkills <hello@swap-skills.ie>",
          to: [recipient.email],
          subject: `💬 ${senderName} is waiting for your reply on SwapSkills`,
          html: generateReminderEmail(recipientName, senderName, msg.content, msg.conversation_id),
        });

        emailsSent++;
        console.log(`Reply reminder sent to ${recipient.email}`);
        await delay(800);
      } catch (emailError) {
        console.error(`Failed to send reminder to ${recipient.email}:`, emailError);
      }
    }

    return new Response(JSON.stringify({ success: true, sent: emailsSent }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-reply-reminder:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

function generateReminderEmail(recipientName: string, senderName: string, messagePreview: string, conversationId: string): string {
  const preview = messagePreview.length > 150 ? messagePreview.substring(0, 150) + "..." : messagePreview;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #faf8f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #fffefa; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
          <tr>
            <td style="background-color: #fffefa; padding: 40px 40px 24px 40px; text-align: center; border-bottom: 2px solid #f97316;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #f97316;">🤝 SwapSkills</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">Ireland's skill sharing community 🍀</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; background-color: #fffefa;">
              <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #1f2937;">
                Hey ${recipientName}! 👋
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                <strong>${senderName}</strong> sent you a message and is still waiting for your reply. Don't leave them hanging!
              </p>
              <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #f97316;">
                <p style="margin: 0; font-size: 14px; color: #6b7280; font-style: italic;">"${preview}"</p>
              </div>
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://swap-skills.ie/messages/${conversationId}" style="display: inline-block; background: #f97316; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);">
                  💬 Reply to ${senderName}
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #faf8f5; padding: 24px 40px; border-top: 1px solid #f0ebe3; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                <a href="https://swap-skills.ie/unsubscribe" style="color: #9ca3af;">Unsubscribe</a> · <a href="https://swap-skills.ie" style="color: #6b7280; text-decoration: none;">swap-skills.ie</a>
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
