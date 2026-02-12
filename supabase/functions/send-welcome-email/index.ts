import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  fullName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName }: WelcomeEmailRequest = await req.json();

    console.log("Welcome email request received for:", email);

    // Initialize Supabase client with service role for deduplication check
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if welcome email was already sent to this email
    const { data: existingEmail, error: checkError } = await supabase
      .from("welcome_emails_sent")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (checkError) {
      console.error("Error checking for existing welcome email:", checkError);
      // Continue anyway - better to risk a duplicate than fail to send
    }

    if (existingEmail) {
      console.log("Welcome email already sent to:", email, "- skipping duplicate");
      return new Response(JSON.stringify({ success: true, skipped: true, reason: "already_sent" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Record that we're sending this email (do this BEFORE sending to prevent race conditions)
    const { error: insertError } = await supabase
      .from("welcome_emails_sent")
      .insert({ email: email.toLowerCase() });

    if (insertError) {
      // If insert fails due to unique constraint, another request already sent the email
      if (insertError.code === "23505") {
        console.log("Welcome email already being sent by another request:", email);
        return new Response(JSON.stringify({ success: true, skipped: true, reason: "concurrent_request" }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      console.error("Error recording welcome email:", insertError);
      // Continue anyway - better to risk a duplicate than fail to send
    }

    const firstName = fullName?.split(" ")[0] || "there";

    const { error } = await resend.emails.send({
      from: "SwapSkills <hello@swap-skills.ie>",
      to: [email],
      subject: "Welcome to Swap Skills! 🎉",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Swap Skills</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with orange to yellow to minty green gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #fbbf24 50%, #4ade80 100%); padding: 48px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                🤝 Swap Skills
              </h1>
              <p style="margin: 12px 0 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.95);">
                Trade skills, not money
              </p>
            </td>
          </tr>
          
          <!-- Main content -->
          <tr>
            <td style="padding: 48px 40px; background-color: #ffffff;">
              <h2 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #1f2937;">
                Welcome aboard, ${firstName}! 👋
              </h2>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                We're thrilled to have you join the Swap Skills community! You've taken the first step toward a new way of exchanging value — one that's built on skills, collaboration, and mutual support.
              </p>
              
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 28px; margin: 32px 0; border: 1px solid #e5e7eb;">
                <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #1f2937;">
                  Here's how to get started:
                </h3>
                
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 14px 0; vertical-align: top; width: 48px;">
                      <span style="display: inline-block; width: 36px; height: 36px; background: linear-gradient(135deg, #f97316, #fbbf24); border-radius: 50%; text-align: center; line-height: 36px; color: white; font-weight: 700; font-size: 16px;">1</span>
                    </td>
                    <td style="padding: 14px 0; vertical-align: middle;">
                      <strong style="color: #1f2937; font-size: 16px;">Complete your profile</strong>
                      <p style="margin: 6px 0 0 0; font-size: 14px; color: #6b7280; line-height: 1.5;">Add your skills and tell others what you're looking for</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 14px 0; vertical-align: top; width: 48px;">
                      <span style="display: inline-block; width: 36px; height: 36px; background: linear-gradient(135deg, #fbbf24, #4ade80); border-radius: 50%; text-align: center; line-height: 36px; color: white; font-weight: 700; font-size: 16px;">2</span>
                    </td>
                    <td style="padding: 14px 0; vertical-align: middle;">
                      <strong style="color: #1f2937; font-size: 16px;">Post your first service</strong>
                      <p style="margin: 6px 0 0 0; font-size: 14px; color: #6b7280; line-height: 1.5;">Offer a skill or request something you need</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 14px 0; vertical-align: top; width: 48px;">
                      <span style="display: inline-block; width: 36px; height: 36px; background: linear-gradient(135deg, #4ade80, #22c55e); border-radius: 50%; text-align: center; line-height: 36px; color: white; font-weight: 700; font-size: 16px;">3</span>
                    </td>
                    <td style="padding: 14px 0; vertical-align: middle;">
                      <strong style="color: #1f2937; font-size: 16px;">Connect with others</strong>
                      <p style="margin: 6px 0 0 0; font-size: 14px; color: #6b7280; line-height: 1.5;">Browse listings and start meaningful conversations</p>
                    </td>
                  </tr>
                </table>
              </div>
              
              <div style="text-align: center; margin: 36px 0;">
                <a href="https://swap-skills.ie/browse" style="display: inline-block; background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(74, 222, 128, 0.4);">
                  Start Exploring →
                </a>
              </div>
              
              <p style="margin: 32px 0 0 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
                If you have any questions, we're here to help! Just reply to this email or visit our <a href="https://swap-skills.ie/faq" style="color: #f97316; text-decoration: none; font-weight: 500;">FAQ page</a>.
              </p>
              
              <p style="margin: 24px 0 0 0; font-size: 16px; color: #4b5563;">
                Happy swapping!<br>
                <strong style="color: #1f2937;">The Swap Skills Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">
                Follow us for tips and updates
              </p>
              <p style="margin: 0 0 24px 0;">
                <a href="#" style="display: inline-block; margin: 0 8px; color: #f97316; text-decoration: none; font-weight: 500;">Twitter</a>
                <a href="#" style="display: inline-block; margin: 0 8px; color: #fbbf24; text-decoration: none; font-weight: 500;">Instagram</a>
                <a href="#" style="display: inline-block; margin: 0 8px; color: #4ade80; text-decoration: none; font-weight: 500;">LinkedIn</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} Swap Skills. All rights reserved.<br>
                <a href="https://swap-skills.ie/privacy" style="color: #6b7280;">Privacy Policy</a> · 
                <a href="https://swap-skills.ie/terms" style="color: #6b7280;">Terms of Service</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      // Remove the record since we failed to send
      await supabase.from("welcome_emails_sent").delete().eq("email", email.toLowerCase());
      throw new Error(error.message);
    }

    console.log("Welcome email sent successfully to:", email);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
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
