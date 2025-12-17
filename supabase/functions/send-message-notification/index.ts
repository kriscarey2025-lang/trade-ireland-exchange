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
  test_email?: string; // For testing purposes
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipient_id, sender_name, message_preview, conversation_id, test_email }: MessageNotificationRequest = await req.json();

    console.log("Sending message notification, recipient:", recipient_id, "test_email:", test_email);

    let recipientEmail: string;
    let recipientName: string;

    // If test_email is provided, use it directly (for testing)
    if (test_email) {
      recipientEmail = test_email;
      recipientName = "Test User";
      console.log("Using test email:", test_email);
    } else {
      // Initialize Supabase client to get recipient email
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Get recipient's email from profiles
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
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; text-align: center; border-bottom: 3px solid #065f46;">
            <h1 style="color: #065f46; margin: 0; font-size: 24px;">🍀 SwapSkills</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px;">
            <h2 style="color: #065f46; margin-top: 0;">Hi ${recipientName}!</h2>
            
            <p style="color: #333;">You have a new message from <strong>${sender_name}</strong>:</p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #065f46; margin: 20px 0;">
              <p style="margin: 0; color: #4b5563; font-style: italic;">"${truncatedMessage}"</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://swap-skills.com/messages/${conversation_id}" 
                 style="background: #065f46; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                View Message
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Don't miss out on potential skill swaps! Log in to continue the conversation.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb;">
            <p>© ${new Date().getFullYear()} SwapSkills Ireland. All rights reserved.</p>
            <p>
              <a href="https://swap-skills.com/unsubscribe" style="color: #9ca3af;">Unsubscribe</a> | 
              <a href="https://swap-skills.com/privacy" style="color: #9ca3af;">Privacy Policy</a>
            </p>
          </div>
        </body>
        </html>
      `,
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

serve(handler);
