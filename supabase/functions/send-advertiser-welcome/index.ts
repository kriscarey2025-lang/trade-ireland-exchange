import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdvertiserWelcomeRequest {
  email: string;
  contact_name: string;
  business_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-advertiser-welcome function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, contact_name, business_name }: AdvertiserWelcomeRequest = await req.json();
    
    console.log(`Sending welcome email to ${email} for business: ${business_name}`);

    const emailResponse = await resend.emails.send({
      from: "SwapSkills <onboarding@resend.dev>",
      to: [email],
      subject: `Welcome to SwapSkills Advertising, ${business_name}! 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #D97706; margin-bottom: 10px;">🎉 Welcome to SwapSkills!</h1>
            <p style="color: #666; font-size: 18px;">We're thrilled to have <strong>${business_name}</strong> as an advertising partner</p>
          </div>

          <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 16px;">Hi ${contact_name},</p>
            <p style="margin-top: 12px;">Your advertising application has been <strong style="color: #059669;">approved!</strong> You're now part of our growing community of local Irish businesses connecting with neighbours who value skill-sharing and community support.</p>
          </div>

          <h2 style="color: #D97706; border-bottom: 2px solid #FDE68A; padding-bottom: 8px;">📋 Getting Started</h2>
          
          <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #374151;">Step 1: Access Your Dashboard</h3>
            <p>Log into SwapSkills and navigate to your <strong>Advertiser Dashboard</strong> where you can create and manage your ads.</p>
            
            <h3 style="color: #374151;">Step 2: Create Your First Ad</h3>
            <ul style="padding-left: 20px;">
              <li><strong>Title:</strong> Keep it catchy and relevant (max 60 characters)</li>
              <li><strong>Description:</strong> Highlight what makes your business special</li>
              <li><strong>Image:</strong> Upload a high-quality image (recommended: 300x250px for side ads, 728x90px for inline ads)</li>
              <li><strong>Link:</strong> Add your website or special offer page</li>
            </ul>
            
            <h3 style="color: #374151;">Step 3: Choose Your Placement</h3>
            <p>You can choose between:</p>
            <ul style="padding-left: 20px;">
              <li><strong>Side Ads:</strong> Appear on the sidebar of pages</li>
              <li><strong>Inline Ads:</strong> Appear within the main content area</li>
            </ul>
          </div>

          <h2 style="color: #D97706; border-bottom: 2px solid #FDE68A; padding-bottom: 8px;">📊 Analytics & Performance</h2>
          
          <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <p>Your dashboard includes comprehensive analytics to track your ad performance:</p>
            <ul style="padding-left: 20px;">
              <li><strong>Impressions:</strong> How many times your ad was viewed</li>
              <li><strong>Clicks:</strong> How many users clicked on your ad</li>
              <li><strong>Click-Through Rate (CTR):</strong> The percentage of impressions that resulted in clicks</li>
              <li><strong>Daily/Weekly Trends:</strong> Visual charts showing performance over time</li>
            </ul>
            <p style="margin-bottom: 0;"><em>💡 Tip: Check your analytics weekly to understand what resonates with our community!</em></p>
          </div>

          <h2 style="color: #D97706; border-bottom: 2px solid #FDE68A; padding-bottom: 8px;">✅ Best Practices</h2>
          
          <div style="background: #F0FDF4; border-left: 4px solid #059669; padding: 16px; margin-bottom: 20px;">
            <ul style="margin: 0; padding-left: 20px;">
              <li>Keep your messaging local and community-focused</li>
              <li>Highlight special offers for SwapSkills members</li>
              <li>Use clear, high-quality images</li>
              <li>Update your ads seasonally to stay relevant</li>
              <li>Respond promptly to any enquiries from the community</li>
            </ul>
          </div>

          <h2 style="color: #D97706; border-bottom: 2px solid #FDE68A; padding-bottom: 8px;">📞 Need Help?</h2>
          
          <p>We're here to support you! If you have any questions about advertising or need assistance setting up your campaigns, don't hesitate to reach out through our contact page.</p>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #D97706 0%, #F59E0B 100%); border-radius: 12px;">
            <a href="https://swap-skills.com/advertiser-dashboard" style="display: inline-block; background: white; color: #D97706; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: bold;">Go to Your Dashboard →</a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; color: #9CA3AF; font-size: 14px;">
            <p>Thank you for supporting local community building! 🍀</p>
            <p>The SwapSkills Team</p>
            <p style="font-size: 12px;">Made with ❤️ in Ireland</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending advertiser welcome email:", error);
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
