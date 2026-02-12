import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Advertiser {
  id: string;
  business_name: string;
  business_email: string;
  user_id: string;
  is_active: boolean;
}

interface Ad {
  id: string;
  title: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Weekly advertiser digest triggered");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body for optional test parameters
    let testEmail: string | null = null;
    let overrideRecipient: string | null = null;
    try {
      const body = await req.json();
      testEmail = body.test_email || null;
      overrideRecipient = body.override_recipient || null;
    } catch {
      // No body or invalid JSON, continue normally
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Calculate date range for last 7 days
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekAgoISO = weekAgo.toISOString();

    // Fetch advertisers - filter by test email if provided
    let query = supabaseAdmin
      .from("advertisers")
      .select("id, business_name, business_email, user_id, is_active");
    
    if (testEmail) {
      console.log(`Test mode: sending only to ${testEmail}`);
      query = query.eq("business_email", testEmail);
    } else {
      query = query.eq("is_active", true);
    }
    
    const { data: advertisers, error: advertisersError } = await query;

    if (advertisersError) {
      console.error("Error fetching advertisers:", advertisersError);
      throw advertisersError;
    }

    if (!advertisers || advertisers.length === 0) {
      console.log("No active advertisers found");
      return new Response(JSON.stringify({ message: "No active advertisers" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${advertisers.length} active advertisers`);

    let emailsSent = 0;
    let errors: string[] = [];

    for (const advertiser of advertisers as Advertiser[]) {
      try {
        // Fetch ads for this advertiser
        const { data: ads, error: adsError } = await supabaseAdmin
          .from("ads")
          .select("id, title")
          .eq("advertiser_id", advertiser.id);

        if (adsError) {
          console.error(`Error fetching ads for ${advertiser.business_name}:`, adsError);
          errors.push(`Failed to fetch ads for ${advertiser.business_name}`);
          continue;
        }

        if (!ads || ads.length === 0) {
          console.log(`No ads for ${advertiser.business_name}, skipping`);
          continue;
        }

        const adIds = ads.map((ad: Ad) => ad.id);

        // Fetch impressions for the week
        let totalImpressions = 0;
        let offset = 0;
        const batchSize = 1000;

        while (true) {
          const { data: impressions, error: impError } = await supabaseAdmin
            .from("ad_impressions")
            .select("id")
            .in("ad_id", adIds)
            .gte("created_at", weekAgoISO)
            .range(offset, offset + batchSize - 1);

          if (impError) throw impError;
          if (!impressions || impressions.length === 0) break;

          totalImpressions += impressions.length;
          if (impressions.length < batchSize) break;
          offset += batchSize;
        }

        // Fetch clicks for the week
        let totalClicks = 0;
        offset = 0;

        while (true) {
          const { data: clicks, error: clickError } = await supabaseAdmin
            .from("ad_clicks")
            .select("id")
            .in("ad_id", adIds)
            .gte("created_at", weekAgoISO)
            .range(offset, offset + batchSize - 1);

          if (clickError) throw clickError;
          if (!clicks || clicks.length === 0) break;

          totalClicks += clicks.length;
          if (clicks.length < batchSize) break;
          offset += batchSize;
        }

        const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

        // Build per-ad breakdown
        let adBreakdownHtml = "";
        for (const ad of ads as Ad[]) {
          // Get impressions for this ad
          const { count: adImpressions } = await supabaseAdmin
            .from("ad_impressions")
            .select("*", { count: "exact", head: true })
            .eq("ad_id", ad.id)
            .gte("created_at", weekAgoISO);

          // Get clicks for this ad
          const { count: adClicks } = await supabaseAdmin
            .from("ad_clicks")
            .select("*", { count: "exact", head: true })
            .eq("ad_id", ad.id)
            .gte("created_at", weekAgoISO);

          const adCtr = (adImpressions || 0) > 0 
            ? (((adClicks || 0) / (adImpressions || 1)) * 100).toFixed(2) 
            : "0.00";

          adBreakdownHtml += `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${ad.title}</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${adImpressions || 0}</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${adClicks || 0}</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${adCtr}%</td>
            </tr>
          `;
        }

        // Format dates for email
        const formatDate = (date: Date) => date.toLocaleDateString('en-IE', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short' 
        });

        // Send email - use override recipient for testing if provided
        const recipientEmail = overrideRecipient || advertiser.business_email;
        console.log(`Sending email to: ${recipientEmail}`);
        
        const emailResponse = await resend.emails.send({
          from: "SwapSkills <hello@swap-skills.ie>",
          to: [recipientEmail],
          subject: `📊 Your Weekly Ad Performance - ${formatDate(weekAgo)} to ${formatDate(now)}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #FAF7F2;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <!-- Header with brand colors -->
                <div style="background: linear-gradient(135deg, #E86C3A 0%, #D4A574 100%); padding: 30px 40px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">📊 Weekly Performance Report</h1>
                  <p style="color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 14px;">${formatDate(weekAgo)} - ${formatDate(now)}</p>
                </div>
                
                <div style="padding: 40px;">
                  <p style="color: #2D5016; font-size: 18px; font-weight: 600; margin-top: 0;">Hi ${advertiser.business_name},</p>
                  
                  <p style="color: #666; font-size: 15px; line-height: 1.6;">Here's your weekly ad performance summary on <span style="color: #E86C3A; font-weight: 600;">SwapSkills</span>:</p>
                  
                  <!-- Stats cards with brand orange -->
                  <div style="background: linear-gradient(135deg, #E86C3A 0%, #C45A2E 100%); border-radius: 12px; padding: 30px; margin: 25px 0; color: white;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="text-align: center;">
                      <tr>
                        <td style="padding: 10px;">
                          <div style="font-size: 36px; font-weight: bold;">${totalImpressions.toLocaleString()}</div>
                          <div style="font-size: 13px; opacity: 0.9; margin-top: 4px;">Impressions</div>
                        </td>
                        <td style="padding: 10px;">
                          <div style="font-size: 36px; font-weight: bold;">${totalClicks.toLocaleString()}</div>
                          <div style="font-size: 13px; opacity: 0.9; margin-top: 4px;">Clicks</div>
                        </td>
                        <td style="padding: 10px;">
                          <div style="font-size: 36px; font-weight: bold;">${ctr}%</div>
                          <div style="font-size: 13px; opacity: 0.9; margin-top: 4px;">CTR</div>
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <h3 style="color: #2D5016; margin-top: 30px; font-size: 16px;">Ad Breakdown</h3>
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px; border-radius: 8px; overflow: hidden;">
                    <thead>
                      <tr style="background-color: #FEF3E7;">
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #E86C3A; color: #2D5016;">Ad Title</th>
                        <th style="padding: 12px; text-align: center; border-bottom: 2px solid #E86C3A; color: #2D5016;">Impressions</th>
                        <th style="padding: 12px; text-align: center; border-bottom: 2px solid #E86C3A; color: #2D5016;">Clicks</th>
                        <th style="padding: 12px; text-align: center; border-bottom: 2px solid #E86C3A; color: #2D5016;">CTR</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${adBreakdownHtml}
                    </tbody>
                  </table>
                  
                  <div style="margin-top: 30px; padding: 20px; background-color: #FEF3E7; border-radius: 8px; border-left: 4px solid #E86C3A;">
                    <p style="margin: 0; color: #666; font-size: 14px;">
                      💡 <strong style="color: #2D5016;">Tip:</strong> A CTR above 1% is considered good for display ads. 
                      Consider updating your ad creative if you'd like to improve engagement.
                    </p>
                  </div>
                  
                  <div style="margin-top: 30px; text-align: center;">
                    <a href="https://swapskills.ie/advertiser-dashboard" 
                       style="display: inline-block; background-color: #E86C3A; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                      View Full Dashboard
                    </a>
                  </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #FAF7F2; padding: 20px 40px; text-align: center; border-top: 1px solid #eee;">
                  <p style="color: #999; font-size: 12px; margin: 0;">
                    You're receiving this because you're an advertiser on <span style="color: #E86C3A;">SwapSkills</span>.<br>
                    🇮🇪 © ${new Date().getFullYear()} SwapSkills Ireland
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        console.log(`Email sent to ${advertiser.business_email}:`, emailResponse);
        emailsSent++;

      } catch (advError: unknown) {
        const errorMessage = advError instanceof Error ? advError.message : String(advError);
        console.error(`Error processing advertiser ${advertiser.business_name}:`, advError);
        errors.push(`Failed to process ${advertiser.business_name}: ${errorMessage}`);
      }
    }

    console.log(`Weekly digest complete. Sent ${emailsSent} emails. Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent, 
        errors: errors.length > 0 ? errors : undefined 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in weekly advertiser digest:", error);
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
