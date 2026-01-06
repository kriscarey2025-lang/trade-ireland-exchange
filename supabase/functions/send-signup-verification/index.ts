import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  confirmationUrl: string;
  fullName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-signup-verification function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, confirmationUrl, fullName }: VerificationEmailRequest = await req.json();

    console.log(`Sending verification email to: ${email}`);

    const firstName = fullName?.split(' ')[0] || 'there';

    const emailResponse = await resend.emails.send({
      from: "SwapSkills <onboarding@resend.dev>",
      to: [email],
      subject: "Verify your SwapSkills account 🤝",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 32px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">SwapSkills</h1>
                      <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Trade skills, build community</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 20px; font-weight: 600;">Welcome, ${firstName}! 👋</h2>
                      
                      <p style="margin: 0 0 24px 0; color: #52525b; font-size: 15px; line-height: 1.6;">
                        Thanks for joining SwapSkills! We're excited to have you in our community of skill swappers across Ireland.
                      </p>
                      
                      <p style="margin: 0 0 24px 0; color: #52525b; font-size: 15px; line-height: 1.6;">
                        Please verify your email address to get started:
                      </p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" style="padding: 8px 0 24px 0;">
                            <a href="${confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                              Verify My Email
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 16px 0; color: #71717a; font-size: 13px; line-height: 1.5;">
                        Or copy and paste this link into your browser:
                      </p>
                      
                      <p style="margin: 0 0 24px 0; padding: 12px; background-color: #f4f4f5; border-radius: 6px; word-break: break-all; font-size: 12px; color: #16a34a;">
                        ${confirmationUrl}
                      </p>
                      
                      <p style="margin: 0; color: #a1a1aa; font-size: 13px; line-height: 1.5;">
                        If you didn't create an account with SwapSkills, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #fafafa; padding: 24px 32px; border-top: 1px solid #e4e4e7;">
                      <p style="margin: 0 0 8px 0; color: #71717a; font-size: 13px; text-align: center;">
                        🇮🇪 Built with love in Ireland
                      </p>
                      <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                        © ${new Date().getFullYear()} SwapSkills. All rights reserved.
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

    console.log("Verification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
