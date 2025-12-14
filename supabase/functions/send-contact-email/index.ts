import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactFormRequest = await req.json();

    console.log("Sending contact form email from:", email);

    // Send notification email to the site owner
    const { error: notifyError } = await resend.emails.send({
      from: "Swap Skills <noreply@swap-skills.com>",
      to: ["hello@swap-skills.com"],
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    if (notifyError) {
      console.error("Error sending notification email:", notifyError);
      throw new Error(notifyError.message);
    }

    // Send confirmation email to the user
    const { error: confirmError } = await resend.emails.send({
      from: "Swap Skills <noreply@swap-skills.com>",
      to: [email],
      subject: "We received your message!",
      html: `
        <h1>Thank you for contacting us, ${name}!</h1>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p>Here's a copy of your message:</p>
        <hr />
        <p><strong>Subject:</strong> ${subject}</p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr />
        <p>Best regards,<br>The Swap Skills Team</p>
      `,
    });

    if (confirmError) {
      console.error("Error sending confirmation email:", confirmError);
      // Don't throw - the main notification was sent
    }

    console.log("Contact form emails sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
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
