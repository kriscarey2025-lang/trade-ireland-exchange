import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TRUSTPILOT_BCC = "swap-skills.com+56613b2422@invite.trustpilot.com";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find users who signed up exactly 7 days ago (within a 24h window)
    // and haven't been sent a Trustpilot invite yet
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const windowStart = new Date(sevenDaysAgo);
    windowStart.setHours(0, 0, 0, 0);
    const windowEnd = new Date(sevenDaysAgo);
    windowEnd.setHours(23, 59, 59, 999);

    // Get profiles created 7 days ago
    const { data: eligibleUsers, error: fetchError } = await supabase
      .from("profiles")
      .select("id, email, full_name, created_at")
      .gte("created_at", windowStart.toISOString())
      .lte("created_at", windowEnd.toISOString())
      .not("email", "is", null);

    if (fetchError) {
      console.error("Error fetching eligible users:", fetchError);
      throw new Error(fetchError.message);
    }

    if (!eligibleUsers || eligibleUsers.length === 0) {
      console.log("No eligible users found for Trustpilot invite today");
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${eligibleUsers.length} eligible users for Trustpilot invite`);

    let sentCount = 0;

    for (const user of eligibleUsers) {
      if (!user.email) continue;

      // Check if already sent
      const { data: alreadySent } = await supabase
        .from("trustpilot_invites_sent")
        .select("id")
        .eq("email", user.email.toLowerCase())
        .maybeSingle();

      if (alreadySent) {
        console.log(`Trustpilot invite already sent to ${user.email}, skipping`);
        continue;
      }

      const firstName = user.full_name?.split(" ")[0] || "there";

      try {
        const { error: emailError } = await resend.emails.send({
          from: "SwapSkills <hello@swap-skills.com>",
          to: [user.email],
          bcc: [TRUSTPILOT_BCC],
          subject: "How's your Swap Skills experience so far? ⭐",
          html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #fbbf24 50%, #4ade80 100%); padding: 48px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff;">
                🤝 Swap Skills
              </h1>
              <p style="margin: 12px 0 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.95);">
                Your first week with us!
              </p>
            </td>
          </tr>
          
          <!-- Main content -->
          <tr>
            <td style="padding: 48px 40px; background-color: #ffffff;">
              <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 700; color: #1f2937;">
                Hey ${firstName}, how are we doing? 👋
              </h2>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                You've been part of the Swap Skills community for a week now! We'd love to hear about your experience so far.
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                Your feedback helps us improve and helps other people in Ireland discover our community. Would you take a moment to share your thoughts?
              </p>
              
              <div style="text-align: center; margin: 36px 0;">
                <a href="https://www.trustpilot.com/review/swap-skills.com" style="display: inline-block; background: linear-gradient(135deg, #00b67a 0%, #00a170 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(0, 182, 122, 0.4);">
                  ⭐ Leave a Review on Trustpilot
                </a>
              </div>
              
              <p style="margin: 32px 0 0 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                Haven't posted your first service yet? It only takes 60 seconds!
              </p>
              
              <div style="text-align: center; margin: 24px 0;">
                <a href="https://swap-skills.com/new-service" style="display: inline-block; background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                  Post Your First Service →
                </a>
              </div>
              
              <p style="margin: 24px 0 0 0; font-size: 16px; color: #4b5563;">
                Thanks for being part of our community!<br>
                <strong style="color: #1f2937;">The Swap Skills Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} Swap Skills Ireland. All rights reserved.<br>
                <a href="https://swap-skills.com/privacy" style="color: #6b7280;">Privacy Policy</a> · 
                <a href="https://swap-skills.com/terms" style="color: #6b7280;">Terms of Service</a>
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

        if (emailError) {
          console.error(`Failed to send Trustpilot invite to ${user.email}:`, emailError);
          continue;
        }

        // Record the sent invite
        await supabase
          .from("trustpilot_invites_sent")
          .insert({ email: user.email.toLowerCase(), user_id: user.id });

        sentCount++;
        console.log(`Trustpilot invite sent to ${user.email}`);
      } catch (sendErr) {
        console.error(`Error sending to ${user.email}:`, sendErr);
      }
    }

    console.log(`Trustpilot invite batch complete: ${sentCount}/${eligibleUsers.length} sent`);

    return new Response(JSON.stringify({ success: true, sent: sentCount, total: eligibleUsers.length }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-trustpilot-invite:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
