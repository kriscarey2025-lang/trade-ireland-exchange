import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignupNotificationRequest {
  email: string;
  full_name: string;
  location: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, full_name, location }: SignupNotificationRequest = await req.json();

    console.log("Sending new signup notification for:", email);

    const emailResponse = await resend.emails.send({
      from: "SwapSkills <onboarding@resend.dev>",
      to: ["krisokyay@gmail.com"],
      subject: "🎉 New SwapSkills User Signup!",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10b981; margin-bottom: 24px;">New User Signup!</h1>
          
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 16px 0; color: #374151;">User Details</h2>
            <p style="margin: 8px 0; color: #4b5563;"><strong>Name:</strong> ${full_name || 'Not provided'}</p>
            <p style="margin: 8px 0; color: #4b5563;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 8px 0; color: #4b5563;"><strong>Location:</strong> ${location || 'Not provided'}</p>
            <p style="margin: 8px 0; color: #4b5563;"><strong>Signed up at:</strong> ${new Date().toLocaleString('en-IE', { timeZone: 'Europe/Dublin' })}</p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
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
    console.error("Error sending signup notification:", error);
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
