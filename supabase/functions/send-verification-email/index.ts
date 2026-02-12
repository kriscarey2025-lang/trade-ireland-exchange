import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  full_name: string;
  approved: boolean;
  rejection_reason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-verification-email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, full_name, approved, rejection_reason }: VerificationEmailRequest = await req.json();
    
    console.log(`Processing verification email for ${email}, approved: ${approved}`);

    if (!email) {
      throw new Error("Email is required");
    }

    const firstName = full_name?.split(" ")[0] || "there";

    let subject: string;
    let html: string;

    if (approved) {
      subject = "🎉 You're now verified on SwapSkills!";
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #E07B39; margin: 0;">SwapSkills</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #E07B39 0%, #D4682F 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 10px 0; font-size: 28px;">🎉 Congratulations!</h2>
            <p style="margin: 0; font-size: 18px;">Your identity has been verified</p>
          </div>
          
          <p style="font-size: 16px;">Hi ${firstName},</p>
          
          <p style="font-size: 16px;">Great news! We've reviewed your ID document and your account is now <strong>verified</strong>.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #E07B39;">
            <h3 style="margin: 0 0 15px 0; color: #E07B39;">✅ What this means for you:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;"><strong>Verified Badge</strong> - A special badge now appears on your profile</li>
              <li style="margin-bottom: 8px;"><strong>Increased Trust</strong> - Other members can see you're a verified user</li>
              <li style="margin-bottom: 8px;"><strong>More Connections</strong> - People are more likely to swap skills with verified members</li>
            </ul>
          </div>
          
          <p style="font-size: 16px;">Your verified badge will now be visible on your profile and next to your name throughout SwapSkills.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://swap-skills.ie/profile" style="display: inline-block; background: linear-gradient(135deg, #E07B39 0%, #D4682F 100%); color: white; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Your Profile</a>
          </div>
          
          <p style="font-size: 16px;">Thank you for being part of our trusted community!</p>
          
          <p style="font-size: 16px;">Best regards,<br><strong>The SwapSkills Team</strong></p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #888; text-align: center;">
            This email was sent by SwapSkills. You received this because your verification was processed.<br>
            <a href="https://swap-skills.ie" style="color: #E07B39;">swap-skills.ie</a>
          </p>
        </body>
        </html>
      `;
    } else {
      subject = "Update on your SwapSkills verification";
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #E07B39; margin: 0;">SwapSkills</h1>
          </div>
          
          <p style="font-size: 16px;">Hi ${firstName},</p>
          
          <p style="font-size: 16px;">Thank you for submitting your ID for verification. Unfortunately, we weren't able to verify your identity at this time.</p>
          
          ${rejection_reason ? `
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="margin: 0 0 10px 0; color: #856404;">Reason:</h3>
            <p style="margin: 0; color: #856404;">${rejection_reason}</p>
          </div>
          ` : ''}
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0;">📝 Common reasons for rejection:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Image is blurry or unclear</li>
              <li style="margin-bottom: 8px;">ID document is expired</li>
              <li style="margin-bottom: 8px;">Name on ID doesn't match your profile</li>
              <li style="margin-bottom: 8px;">Document type not accepted</li>
            </ul>
          </div>
          
          <p style="font-size: 16px;">You're welcome to submit a new verification request with a clearer image or different document.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://swap-skills.ie/profile" style="display: inline-block; background: linear-gradient(135deg, #E07B39 0%, #D4682F 100%); color: white; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">Try Again</a>
          </div>
          
          <p style="font-size: 16px;">If you have any questions, feel free to contact us.</p>
          
          <p style="font-size: 16px;">Best regards,<br><strong>The SwapSkills Team</strong></p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #888; text-align: center;">
            This email was sent by SwapSkills. You received this because your verification was processed.<br>
            <a href="https://swap-skills.ie" style="color: #E07B39;">swap-skills.ie</a>
          </p>
        </body>
        </html>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "SwapSkills <hello@swap-skills.ie>",
      to: [email],
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
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
