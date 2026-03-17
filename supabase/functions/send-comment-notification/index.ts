import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { service_owner_id, commenter_name, comment_text, service_id, service_title } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get owner's email and preferences
    const { data: owner } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', service_owner_id)
      .single();

    if (!owner?.email) {
      return new Response(JSON.stringify({ error: 'No email found' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user has email notifications enabled
    const { data: prefs } = await supabaseAdmin
      .from('user_preferences')
      .select('interest_emails_enabled, weekly_digest_enabled')
      .eq('user_id', service_owner_id)
      .single();

    // Respect the master opt-out
    if (prefs?.weekly_digest_enabled === false) {
      return new Response(JSON.stringify({ skipped: 'User opted out' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const ownerFirst = owner.full_name?.split(' ')[0] || 'there';
    const commentPreview = comment_text.length > 200 ? comment_text.substring(0, 200) + '...' : comment_text;
    const listingUrl = `https://swap-skills.ie/services/${service_id}`;

    const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background-color: #FFF8F0; padding: 32px 24px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 32px;">🤝</span>
      </div>
      <div style="background: white; border-radius: 12px; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <h2 style="color: #1a1a1a; margin: 0 0 8px 0; font-size: 20px;">New comment on your listing</h2>
        <p style="color: #666; margin: 0 0 20px 0; font-size: 15px;">
          Hi ${ownerFirst}, <strong>${commenter_name}</strong> left a comment on "<strong>${service_title}</strong>":
        </p>
        <div style="background: #f8f8f8; border-left: 3px solid #E97706; padding: 14px 16px; border-radius: 6px; margin-bottom: 24px;">
          <p style="color: #333; margin: 0; font-size: 14px; line-height: 1.5;">${commentPreview}</p>
        </div>
        <div style="text-align: center;">
          <a href="${listingUrl}" style="display: inline-block; background: #E97706; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;">View & Reply</a>
        </div>
      </div>
      <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
        SwapSkills — Ireland's Skill Swapping Community 🇮🇪
      </p>
    </div>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'SwapSkills <notifications@swap-skills.ie>',
        to: [owner.email],
        subject: `💬 ${commenter_name} commented on "${service_title}"`,
        html: emailHtml,
      }),
    });

    const result = await res.json();
    console.log('Comment notification email sent:', result);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending comment notification:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
