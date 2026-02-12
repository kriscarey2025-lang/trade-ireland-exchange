import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReviewNotificationRequest {
  reviewed_user_id: string;
  reviewer_name: string;
  review_text: string | null;
  user_rating: number;
  conversation_id: string;
  reviewer_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      reviewed_user_id,
      reviewer_name,
      review_text,
      user_rating,
      conversation_id,
      reviewer_id,
    }: ReviewNotificationRequest = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the reviewed user's details
    const { data: reviewedUser, error: userError } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", reviewed_user_id)
      .single();

    if (userError || !reviewedUser?.email) {
      console.error("Error fetching reviewed user:", userError);
      return new Response(
        JSON.stringify({ error: "Could not find reviewed user" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the reviewed user has already left a review for this conversation
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("conversation_id", conversation_id)
      .eq("reviewer_id", reviewed_user_id)
      .single();

    const hasReviewedBack = !!existingReview;

    const reviewUrl = `https://swap-skills.ie/messages/${conversation_id}`;
    const stars = "⭐".repeat(user_rating);
    const firstName = reviewedUser.full_name?.split(" ")[0] || "there";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                🎉 You received a review!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 18px; color: #333333;">
                Hi ${firstName}!
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; color: #555555; line-height: 1.6;">
                Great news! <strong>${reviewer_name}</strong> just left you a review for your skill swap:
              </p>
              
              <!-- Review Card -->
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 24px; margin: 20px 0; border-left: 4px solid #16a34a;">
                <div style="font-size: 24px; margin-bottom: 12px;">
                  ${stars}
                </div>
                ${review_text ? `
                <p style="margin: 0; font-size: 16px; color: #374151; font-style: italic; line-height: 1.6;">
                  "${review_text}"
                </p>
                ` : ''}
              </div>
              
              ${!hasReviewedBack ? `
              <p style="margin: 20px 0; font-size: 16px; color: #555555; line-height: 1.6;">
                Would you like to leave a review for <strong>${reviewer_name}</strong> in return? It only takes a moment and helps build trust in our community! 💚
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${reviewUrl}" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.4);">
                      ✍️ Leave a Review for ${reviewer_name.split(" ")[0]}
                    </a>
                  </td>
                </tr>
              </table>
              ` : `
              <p style="margin: 20px 0; font-size: 16px; color: #555555; line-height: 1.6;">
                Thank you for being part of our skill-swapping community! 💚
              </p>
              `}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">
                Swap Skills - Ireland's Skill Exchange Community
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                <a href="https://swap-skills.ie" style="color: #16a34a; text-decoration: none;">swap-skills.ie</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send email using Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SwapSkills <hello@swap-skills.ie>",
        to: [reviewedUser.email],
        subject: `⭐ ${reviewer_name} just left you a ${user_rating}-star review!`,
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json();

    console.log("Review notification email sent:", emailData);

    // Also create an in-app notification
    await supabase.from("notifications").insert({
      user_id: reviewed_user_id,
      type: "review_received",
      title: "New Review Received!",
      message: `${reviewer_name} left you a ${user_rating}-star review${!hasReviewedBack ? ". Tap to leave a review in return!" : "!"}`,
      related_service_id: null,
    });

    return new Response(
      JSON.stringify({ success: true, emailId: emailData?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-review-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
