import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewServiceNotificationRequest {
  service_id: string;
  service_title: string;
  service_description: string | null;
  service_category: string;
  service_location: string | null;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      service_id,
      service_title,
      service_description,
      service_category,
      service_location,
      user_name,
      user_email,
    }: NewServiceNotificationRequest = await req.json();

    console.log("Sending new service offer notification for:", service_title);

    const emailResponse = await resend.emails.send({
      from: "SwapSkills <hello@swap-skills.com>",
      to: ["krisokyay@gmail.com"],
      subject: "🆕 New Service Offer Posted!",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10b981; margin-bottom: 24px;">New Service Offer!</h1>
          
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 16px 0; color: #374151;">${service_title}</h2>
            
            <p style="margin: 8px 0; color: #4b5563;"><strong>Category:</strong> ${service_category}</p>
            <p style="margin: 8px 0; color: #4b5563;"><strong>Location:</strong> ${service_location || 'Not specified'}</p>
            
            ${service_description ? `
              <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>Description:</strong></p>
                <p style="margin: 8px 0 0 0; color: #4b5563;">${service_description}</p>
              </div>
            ` : ''}
          </div>
          
          <div style="background-color: #ecfdf5; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 12px 0; color: #065f46;">Posted by</h3>
            <p style="margin: 4px 0; color: #047857;"><strong>Name:</strong> ${user_name || 'Not provided'}</p>
            <p style="margin: 4px 0; color: #047857;"><strong>Email:</strong> ${user_email || 'Not provided'}</p>
          </div>
          
          <p style="margin: 16px 0; color: #4b5563;">
            <a href="https://swap-skills.com/service/${service_id}" style="color: #10b981; text-decoration: underline;">View Service</a>
          </p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            Posted at: ${new Date().toLocaleString('en-IE', { timeZone: 'Europe/Dublin' })}
          </p>
          
          <p style="color: #9ca3af; font-size: 12px; margin-top: 16px;">
            This is an automated notification from SwapSkills.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending new service notification:", error);
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
