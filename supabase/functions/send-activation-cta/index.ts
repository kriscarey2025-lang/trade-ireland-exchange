import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface RequestBody {
  test_email?: string;
  dry_run?: boolean;
  only_emails?: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting activation CTA email job...");

    let testEmail: string | null = null;
    let dryRun = false;
    let onlyEmails: string[] | null = null;
    
    try {
      const body: RequestBody = await req.json();
      testEmail = body.test_email || null;
      dryRun = body.dry_run || false;
      onlyEmails = body.only_emails || null;
    } catch {
      // No body or invalid JSON
    }

    if (dryRun) {
      console.log("🧪 DRY RUN MODE - No emails will actually be sent");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Test mode: send to a specific email
    if (testEmail) {
      console.log("Sending test CTA email to:", testEmail);
      
      try {
        await resend.emails.send({
          from: "SwapSkills <hello@swap-skills.ie>",
          to: [testEmail],
          subject: "🌟 Your neighbours are swapping skills — join them!",
          html: generateCTAEmail("there"),
        });

        return new Response(JSON.stringify({ success: true, sent: 1, test: true }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      } catch (emailError) {
        console.error("Test email error:", emailError);
        return new Response(JSON.stringify({ success: false, error: String(emailError) }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    // Get today's date at midnight for excluding new signups
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Get all registered users (excluding those who registered today)
    const { data: allProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, full_name, created_at")
      .lt("created_at", todayISO);

    if (profilesError) throw profilesError;

    if (!allProfiles || allProfiles.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, reason: "no_users" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get users who have posted services
    const { data: usersWithServices, error: servicesError } = await supabase
      .from("services")
      .select("user_id")
      .not("user_id", "is", null);

    if (servicesError) throw servicesError;

    // Get users who have sent messages
    const { data: usersWithMessages, error: messagesError } = await supabase
      .from("messages")
      .select("sender_id")
      .not("sender_id", "is", null);

    if (messagesError) throw messagesError;

    // Create sets of active user IDs
    const activeUserIds = new Set<string>();
    
    usersWithServices?.forEach(s => {
      if (s.user_id) activeUserIds.add(s.user_id);
    });
    
    usersWithMessages?.forEach(m => {
      if (m.sender_id) activeUserIds.add(m.sender_id);
    });

    console.log(`Total users: ${allProfiles.length}`);
    console.log(`Users with services or messages: ${activeUserIds.size}`);

    // Filter to get inactive users only
    const inactiveUsers = allProfiles.filter(
      profile => profile.email && !activeUserIds.has(profile.id)
    );

    console.log(`Inactive users to email: ${inactiveUsers.length}`);

    if (inactiveUsers.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, reason: "no_inactive_users" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let emailsSent = 0;
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (const user of inactiveUsers) {
      if (!user.email) continue;

      // If only_emails is specified, skip users not in that list
      if (onlyEmails && onlyEmails.length > 0 && !onlyEmails.includes(user.email)) {
        continue;
      }

      const firstName = user.full_name?.split(" ")[0] || "there";

      // DRY RUN: Just log what would be sent
      if (dryRun) {
        console.log(`[DRY RUN] Would send CTA to ${user.email} (${firstName})`);
        emailsSent++;
        continue;
      }

      try {
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: "SwapSkills <hello@swap-skills.ie>",
          to: [user.email],
          subject: "🌟 Your neighbours are swapping skills — join them!",
          html: generateCTAEmail(firstName),
        });

        if (emailError) {
          console.error(`Resend API error for ${user.email}:`, JSON.stringify(emailError));
          continue;
        }

        emailsSent++;
        console.log(`Successfully sent CTA to ${user.email} (id: ${emailData?.id})`);
        
        // Wait 1 second AFTER sending to respect Resend's rate limit
        await delay(1000);

      } catch (emailError) {
        console.error(`Failed to send email to ${user.email}:`, emailError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      sent: emailsSent,
      total_inactive: inactiveUsers.length,
      dry_run: dryRun
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-activation-cta function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateCTAEmail(firstName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Neighbours Are Swapping Skills</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #faf8f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #fffefa; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #fffefa; padding: 40px 40px 24px 40px; text-align: center; border-bottom: 2px solid #f97316;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #f97316; letter-spacing: -0.5px;">
                🤝 SwapSkills
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">
                Ireland's skill sharing community 🍀
              </p>
            </td>
          </tr>
          
          <!-- Main content -->
          <tr>
            <td style="padding: 40px; background-color: #fffefa;">
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #1f2937;">
                Hey ${firstName}! 👋
              </h2>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                We noticed you joined SwapSkills but haven't taken the leap yet. <strong>Now's the perfect time!</strong>
              </p>
              
              <!-- Two paths -->
              <div style="background: linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #f97316;">
                <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #c2410c;">
                  🎯 Two ways to get started:
                </h3>
                <p style="margin: 0 0 12px 0; font-size: 16px; line-height: 1.7; color: #78350f;">
                  <strong>1. See something you'd love?</strong><br>
                  Browse what your neighbours are offering and reach out to someone — it's as simple as sending a quick message!
                </p>
                <p style="margin: 0; font-size: 16px; line-height: 1.7; color: #78350f;">
                  <strong>2. Got a skill to share?</strong><br>
                  Post your first offer and let the magic begin. You'd be surprised who's looking for exactly what you can do!
                </p>
              </div>
              
              <p style="margin: 0 0 24px 0; font-size: 18px; line-height: 1.7; color: #1f2937; text-align: center; font-weight: 600;">
                ✨ Nothing to lose, lots to gain ✨
              </p>
              
              <!-- Two CTAs -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://swap-skills.ie/browse" style="display: inline-block; background: #f97316; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3); margin-bottom: 12px;">
                  🔍 Browse Skills Near You
                </a>
                <br>
                <a href="https://swap-skills.ie/services/new" style="display: inline-block; background: #ffffff; color: #f97316; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 16px; font-weight: 600; border: 2px solid #f97316; margin-top: 12px;">
                  ✨ Share My First Skill
                </a>
              </div>
              
              <p style="margin: 24px 0 0 0; font-size: 16px; line-height: 1.7; color: #4b5563; text-align: center;">
                Go on — give it a go! 🧡
              </p>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #faf8f5; padding: 32px 40px; border-top: 1px solid #f0ebe3;">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">
                      Built with 🧡 in Ireland
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                      <a href="https://swap-skills.ie" style="color: #6b7280; text-decoration: none;">swap-skills.ie</a>
                    </p>
                    <p style="margin: 16px 0 0 0; font-size: 11px; color: #9ca3af;">
                      You're receiving this because you signed up for SwapSkills.<br>
                      <a href="https://swap-skills.ie/unsubscribe" style="color: #9ca3af;">Unsubscribe from all emails</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

serve(handler);
