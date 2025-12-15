import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

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

    console.log("Sending welcome email to:", email);

    const firstName = fullName?.split(" ")[0] || "there";

    const { error } = await resend.emails.send({
      from: "Swap Skills <noreply@swap-skills.com>",
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
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1a1a2e;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #1a1a2e; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">
          
          <!-- Header with orange to green gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #22c55e 100%); padding: 48px 40px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                🔄 Swap Skills
              </h1>
              <p style="margin: 12px 0 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.9);">
                Trade skills, not money
              </p>
            </td>
          </tr>
          
          <!-- Main content -->
          <tr>
            <td style="padding: 48px 40px;">
              <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #ffffff;">
                Welcome aboard, ${firstName}! 👋
              </h2>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #a1a1aa;">
                We're thrilled to have you join the Swap Skills community! You've taken the first step toward a new way of exchanging value — one that's built on skills, collaboration, and mutual support.
              </p>
              
              <div style="background-color: #252542; border-radius: 12px; padding: 24px; margin: 32px 0;">
                <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #ffffff;">
                  Here's how to get started:
                </h3>
                
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; vertical-align: top; width: 44px;">
                      <span style="display: inline-block; width: 32px; height: 32px; background: linear-gradient(135deg, #f97316, #22c55e); border-radius: 50%; text-align: center; line-height: 32px; color: white; font-weight: 600;">1</span>
                    </td>
                    <td style="padding: 12px 0; vertical-align: middle;">
                      <strong style="color: #ffffff;">Complete your profile</strong>
                      <p style="margin: 4px 0 0 0; font-size: 14px; color: #a1a1aa;">Add your skills and tell others what you're looking for</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; vertical-align: top; width: 44px;">
                      <span style="display: inline-block; width: 32px; height: 32px; background: linear-gradient(135deg, #f97316, #22c55e); border-radius: 50%; text-align: center; line-height: 32px; color: white; font-weight: 600;">2</span>
                    </td>
                    <td style="padding: 12px 0; vertical-align: middle;">
                      <strong style="color: #ffffff;">Post your first service</strong>
                      <p style="margin: 4px 0 0 0; font-size: 14px; color: #a1a1aa;">Offer a skill or request something you need</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; vertical-align: top; width: 44px;">
                      <span style="display: inline-block; width: 32px; height: 32px; background: linear-gradient(135deg, #f97316, #22c55e); border-radius: 50%; text-align: center; line-height: 32px; color: white; font-weight: 600;">3</span>
                    </td>
                    <td style="padding: 12px 0; vertical-align: middle;">
                      <strong style="color: #ffffff;">Connect with others</strong>
                      <p style="margin: 4px 0 0 0; font-size: 14px; color: #a1a1aa;">Browse listings and start meaningful conversations</p>
                    </td>
                  </tr>
                </table>
              </div>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://swap-skills.com/browse" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #22c55e 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4);">
                  Start Exploring →
                </a>
              </div>
              
              <p style="margin: 32px 0 0 0; font-size: 16px; line-height: 1.6; color: #a1a1aa;">
                If you have any questions, we're here to help! Just reply to this email or visit our FAQ page.
              </p>
              
              <p style="margin: 24px 0 0 0; font-size: 16px; color: #a1a1aa;">
                Happy swapping!<br>
                <strong style="color: #ffffff;">The Swap Skills Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #16162a; padding: 32px 40px; text-align: center; border-top: 1px solid #252542;">
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #71717a;">
                Follow us for tips and updates
              </p>
              <p style="margin: 0 0 24px 0;">
                <a href="#" style="display: inline-block; margin: 0 8px; color: #f97316; text-decoration: none;">Twitter</a>
                <a href="#" style="display: inline-block; margin: 0 8px; color: #22c55e; text-decoration: none;">Instagram</a>
                <a href="#" style="display: inline-block; margin: 0 8px; color: #f97316; text-decoration: none;">LinkedIn</a>
              </p>
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
      `,
    });

    if (error) {
      console.error("Error sending welcome email:", error);
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
