import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    console.log(`Checking for swaps with completion date: ${today}`);

    // Find all accepted swaps with completion date = today
    const { data: swaps, error: swapsError } = await supabase
      .from("conversations")
      .select(`
        id,
        participant_1,
        participant_2,
        agreed_completion_date,
        offered_skill,
        service_id,
        services!conversations_service_id_fkey (title)
      `)
      .eq("swap_status", "accepted")
      .gte("agreed_completion_date", `${today}T00:00:00`)
      .lt("agreed_completion_date", `${today}T23:59:59`);

    if (swapsError) {
      console.error("Error fetching swaps:", swapsError);
      throw swapsError;
    }

    console.log(`Found ${swaps?.length || 0} swaps with completion date today`);

    if (!swaps || swaps.length === 0) {
      return new Response(JSON.stringify({ message: "No swaps due today" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let notificationsSent = 0;

    for (const swap of swaps) {
      const serviceTitle = (swap.services as any)?.title || "the service";
      const offeredSkill = swap.offered_skill || "their skill";
      
      // Get both participants' profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", [swap.participant_1, swap.participant_2]);

      if (profilesError || !profiles) {
        console.error(`Error fetching profiles for swap ${swap.id}:`, profilesError);
        continue;
      }

      const participant1 = profiles.find(p => p.id === swap.participant_1);
      const participant2 = profiles.find(p => p.id === swap.participant_2);

      if (!participant1 || !participant2) {
        console.error(`Missing participant profiles for swap ${swap.id}`);
        continue;
      }

      // Create in-app notifications for both users
      const notificationTitle = "🎯 Skill Exchange Due Today!";
      const notificationMessage = `Your skill exchange "${offeredSkill}" ↔ "${serviceTitle}" is due today. Time to mark it complete and leave a review!`;

      // Insert notifications for both participants
      const { error: notifError } = await supabase
        .from("notifications")
        .insert([
          {
            user_id: swap.participant_1,
            type: "swap_reminder",
            title: notificationTitle,
            message: notificationMessage,
          },
          {
            user_id: swap.participant_2,
            type: "swap_reminder",
            title: notificationTitle,
            message: notificationMessage,
          },
        ]);

      if (notifError) {
        console.error(`Error creating notifications for swap ${swap.id}:`, notifError);
      } else {
        notificationsSent += 2;
      }

      // Send email to both participants
      for (const participant of [participant1, participant2]) {
        if (!participant.email) continue;

        const otherParticipant = participant.id === swap.participant_1 ? participant2 : participant1;
        const firstName = participant.full_name?.split(' ')[0] || 'there';

        try {
          await resend.emails.send({
            from: "SwapSkills <hello@swap-skills.ie>",
            to: [participant.email],
            subject: "🎯 Your Skill Exchange is Due Today!",
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
                    <span style="font-size: 48px;">🎯</span>
                    <h1 style="color: white; margin: 16px 0 0 0; font-size: 24px;">Skill Exchange Due Today!</h1>
                  </div>
                  <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px;">
                    <p style="font-size: 16px; color: #374151; margin: 0 0 16px 0;">Hi ${firstName},</p>
                    <p style="font-size: 16px; color: #374151; margin: 0 0 24px 0;">
                      Your skill exchange with <strong>${otherParticipant.full_name || 'your swap partner'}</strong> is scheduled to complete today!
                    </p>
                    <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                      <p style="margin: 0; color: #166534; font-size: 14px; font-weight: 600;">Exchange Details:</p>
                      <p style="margin: 8px 0 0 0; color: #166534; font-size: 16px;">
                        <strong>${offeredSkill}</strong> ↔ <strong>${serviceTitle}</strong>
                      </p>
                    </div>
                    <p style="font-size: 16px; color: #374151; margin: 0 0 24px 0;">
                      Once you've completed the exchange, head to your conversation to mark it as complete and leave a review for your swap partner.
                    </p>
                    <div style="text-align: center;">
                      <a href="https://swapskills.ie/messages/${swap.id}" 
                         style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        View Conversation
                      </a>
                    </div>
                    <p style="font-size: 14px; color: #6b7280; margin: 24px 0 0 0; text-align: center;">
                      Happy swapping! 🌱
                    </p>
                  </div>
                </div>
              </body>
              </html>
            `,
          });
          console.log(`Email sent to ${participant.email} for swap ${swap.id}`);
        } catch (emailError) {
          console.error(`Error sending email to ${participant.email}:`, emailError);
        }
      }
    }

    console.log(`Completion reminders sent: ${notificationsSent} notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        swapsProcessed: swaps.length,
        notificationsSent 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error in send-completion-reminders:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
