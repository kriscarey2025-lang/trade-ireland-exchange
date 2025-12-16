import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdvertiserRejectionRequest {
  email: string;
  contact_name: string;
  business_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-advertiser-rejection function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, contact_name, business_name }: AdvertiserRejectionRequest = await req.json();
    
    console.log(`Sending rejection email to ${email} for business: ${business_name}`);

    const emailResponse = await resend.emails.send({
      from: "Swap Skills <noreply@swap-skills.com>",
      to: [email],
      subject: `Update on Your SwapSkills Advertising Application`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #D97706; margin-bottom: 10px;">SwapSkills Advertising</h1>
          </div>

          <div style="background: #F9FAFB; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 16px;">Hi ${contact_name},</p>
            <p style="margin-top: 12px;">Thank you for your interest in advertising with SwapSkills. After reviewing your application for <strong>${business_name}</strong>, we regret to inform you that we are unable to approve it at this time.</p>
          </div>

          <div style="background: #FEF3C7; border-left: 4px solid #D97706; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0;">This decision was made in accordance with our <strong>Terms & Conditions</strong> and advertising guidelines, which help us maintain a trusted and community-focused platform for our users.</p>
          </div>

          <h2 style="color: #374151; font-size: 18px;">What You Can Do</h2>
          
          <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <ul style="margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Review our Terms & Conditions and advertising guidelines on our website</li>
              <li style="margin-bottom: 8px;">If you believe this decision was made in error, please don't hesitate to contact us</li>
              <li style="margin-bottom: 8px;">You're welcome to submit a new application in the future if circumstances change</li>
            </ul>
          </div>

          <h2 style="color: #374151; font-size: 18px;">Questions?</h2>
          
          <p>If you have any questions about this decision or would like to discuss your application further, we'd be happy to hear from you. Please reach out to us through our contact page and we'll get back to you as soon as possible.</p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://swap-skills.com/contact" style="display: inline-block; background: #D97706; color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: bold;">Contact Us</a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; color: #9CA3AF; font-size: 14px;">
            <p>Thank you for your understanding.</p>
            <p>The SwapSkills Team</p>
            <p style="font-size: 12px;">Made with ❤️ in Ireland 🍀</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Rejection email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending advertiser rejection email:", error);
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
