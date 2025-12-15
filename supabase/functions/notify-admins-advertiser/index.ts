import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyRequest {
  businessName: string;
  contactName: string;
  email: string;
  location: string;
  website?: string;
  message?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessName, contactName, email, location, website, message }: NotifyRequest = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get admin emails
    const { data: adminRoles } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (!adminRoles || adminRoles.length === 0) {
      return new Response(JSON.stringify({ message: "No admins to notify" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminUserIds = adminRoles.map(r => r.user_id);
    const { data: adminProfiles } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .in("id", adminUserIds)
      .not("email", "is", null);

    const adminEmails = adminProfiles?.map(p => p.email).filter(Boolean) as string[] || [];
    
    if (adminEmails.length === 0) {
      return new Response(JSON.stringify({ message: "No admin emails found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Sending advertiser notification to ${adminEmails.length} admin(s)`);

    const emailResponse = await resend.emails.send({
      from: "Swap Skills <onboarding@resend.dev>",
      to: adminEmails,
      subject: "📢 New Advertiser Interest - Swap Skills",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📢 New Advertiser Interest</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="margin-top: 0;">A business has expressed interest in advertising on Swap Skills!</p>
            
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Business Name:</strong> ${businessName}</p>
              <p style="margin: 0 0 10px 0;"><strong>Contact Name:</strong> ${contactName}</p>
              <p style="margin: 0 0 10px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #2563eb;">${email}</a></p>
              <p style="margin: 0 0 10px 0;"><strong>Location:</strong> ${location}</p>
              ${website ? `<p style="margin: 0 0 10px 0;"><strong>Website:</strong> <a href="${website}" target="_blank" style="color: #2563eb;">${website}</a></p>` : ''}
              ${message ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 5px 0;"><strong>Message:</strong></p>
                  <p style="margin: 0; color: #4b5563; font-style: italic;">"${message}"</p>
                </div>
              ` : ''}
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="https://swapskills.lovable.app/admin/advertisers" 
                 style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">
                View All Requests
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 25px; text-align: center;">
              This is an automated message from Swap Skills.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in notify-admins-advertiser:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
