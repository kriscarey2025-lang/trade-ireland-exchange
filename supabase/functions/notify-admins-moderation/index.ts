import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyAdminsRequest {
  serviceId: string;
  serviceTitle: string;
  moderationReason: string;
  posterName: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { serviceId, serviceTitle, moderationReason, posterName }: NotifyAdminsRequest = await req.json();

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all admin user IDs
    const { data: adminRoles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (rolesError) {
      console.error("Error fetching admin roles:", rolesError);
      throw rolesError;
    }

    if (!adminRoles || adminRoles.length === 0) {
      console.log("No admins found to notify");
      return new Response(JSON.stringify({ message: "No admins to notify" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get admin emails from profiles
    const adminUserIds = adminRoles.map(r => r.user_id);
    const { data: adminProfiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name")
      .in("id", adminUserIds)
      .not("email", "is", null);

    if (profilesError) {
      console.error("Error fetching admin profiles:", profilesError);
      throw profilesError;
    }

    if (!adminProfiles || adminProfiles.length === 0) {
      console.log("No admin emails found");
      return new Response(JSON.stringify({ message: "No admin emails found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminEmails = adminProfiles.map(p => p.email).filter(Boolean) as string[];
    console.log(`Sending moderation notification to ${adminEmails.length} admin(s)`);

    const moderationUrl = `${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app')}/admin/moderation`;

    // Send email to all admins
    const emailResponse = await resend.emails.send({
      from: "Swap Skills <onboarding@resend.dev>",
      to: adminEmails,
      subject: "⚠️ Post Flagged for Review - Swap Skills",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Content Flagged</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="margin-top: 0;">A new post has been flagged by our AI moderation system and requires your review.</p>
            
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Post Title:</strong> ${serviceTitle}</p>
              <p style="margin: 0 0 10px 0;"><strong>Posted By:</strong> ${posterName || 'Unknown'}</p>
              <p style="margin: 0;"><strong>Flag Reason:</strong></p>
              <p style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; color: #991b1b; margin: 10px 0 0 0;">
                ${moderationReason}
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="https://swapskills.lovable.app/admin/moderation" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">
                Review Now
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 25px; text-align: center;">
              This is an automated message from Swap Skills moderation system.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in notify-admins-moderation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
