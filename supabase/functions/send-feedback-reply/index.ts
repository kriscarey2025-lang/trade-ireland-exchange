import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReplyRequest {
  feedbackId: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  replyMessage: string;
  originalMessage: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-feedback-reply function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      console.error("User is not admin");
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { feedbackId, recipientEmail, recipientName, subject, replyMessage, originalMessage }: ReplyRequest = await req.json();

    console.log("Sending reply to:", recipientEmail);

    // Send the reply email
    const emailResponse = await resend.emails.send({
      from: "Swap Skills <noreply@swap-skills.ie>",
      to: [recipientEmail],
      subject: `Re: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Swap Skills</h1>
          </div>
          
          <div style="padding: 30px; background: #fff; border: 1px solid #eee; border-top: none;">
            <p style="font-size: 16px; color: #333;">Hi ${recipientName || 'there'},</p>
            
            <div style="font-size: 15px; color: #333; line-height: 1.6; white-space: pre-wrap;">${replyMessage}</div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #D2691E;">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #666; font-weight: bold;">Your original message:</p>
              <p style="margin: 0; font-size: 14px; color: #666; white-space: pre-wrap;">${originalMessage}</p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Best regards,<br>
              <strong>The Swap Skills Team</strong>
            </p>
          </div>
          
          <div style="padding: 20px; background: #f5f5f5; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #999;">
              This email was sent in response to your message on Swap Skills.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Update the feedback status to "reviewed"
    await supabase
      .from("user_feedback")
      .update({ 
        status: "reviewed",
        admin_notes: `Replied on ${new Date().toLocaleDateString()}: ${replyMessage.substring(0, 100)}...`
      })
      .eq("id", feedbackId);

    // Check if the email belongs to a registered user and send in-app notification
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", recipientEmail)
      .maybeSingle();

    if (userProfile) {
      console.log("Creating in-app notification for user:", userProfile.id);
      await supabase.from("notifications").insert({
        user_id: userProfile.id,
        type: "admin_reply",
        title: "Reply from Swap Skills Team",
        message: replyMessage.substring(0, 200) + (replyMessage.length > 200 ? "..." : ""),
      });
    }

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-feedback-reply function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
