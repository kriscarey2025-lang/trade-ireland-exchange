import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const baseUrl = "https://swap-skills.ie";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUBJECT = "3 fresh skill swaps on Swap Skills and a quick favour";

interface ManualBody {
  segment?: 1 | 2;
  run_id?: string;
  test_email?: string;
  dry_run?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let body: ManualBody = {};
  try { body = await req.json(); } catch { /* cron call */ }

  // Resolve which run to process
  let run: { id: string; segment: number } | null = null;
  if (body.run_id) {
    const { data } = await supabase.from("newsletter_runs").select("id, segment").eq("id", body.run_id).maybeSingle();
    if (data) run = data;
  } else if (!body.test_email && !body.segment) {
    const { data } = await supabase
      .from("newsletter_runs")
      .select("id, segment")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .order("scheduled_for", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (data) run = data;
    else return new Response(JSON.stringify({ ok: true, message: "no pending runs" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const segment = (run?.segment ?? body.segment ?? 1) as 1 | 2;

  if (run) {
    await supabase.from("newsletter_runs").update({ status: "running" }).eq("id", run.id);
  }

  try {
    // Fetch the 3 latest active, approved offer/skill_swap services
    const { data: services } = await supabase
      .from("services")
      .select("id, title, description, category, location, images, user_id")
      .in("type", ["offer", "skill_swap"])
      .eq("status", "active")
      .eq("moderation_status", "approved")
      .order("created_at", { ascending: false })
      .limit(3);

    const featured = (services || []).map((s: any) => {
      const slug = (s.title || "service").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
      return {
        url: `${baseUrl}/services/${slug}-${s.id}`,
        title: s.title as string,
        description: (s.description || "").toString().slice(0, 180),
        category: s.category as string,
        location: (s.location || "Ireland") as string,
        image: (s.images && s.images[0]) || null,
      };
    });

    // Test mode
    if (body.test_email) {
      await resend.emails.send({
        from: "SwapSkills <hello@swap-skills.ie>",
        to: [body.test_email],
        subject: SUBJECT,
        html: renderEmail("there", featured),
      });
      return new Response(JSON.stringify({ ok: true, test: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // All recipients (everyone in profiles with an email)
    const { data: profiles, error: profErr } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .not("email", "is", null)
      .order("id", { ascending: true });
    if (profErr) throw profErr;

    // Deterministic random split: hash uuid -> even/odd bucket
    const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };
    const recipients = (profiles || []).filter((p: any) => p.email && (hash(p.id) % 2 === (segment === 1 ? 0 : 1)));

    let sent = 0, errors = 0;
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    for (const p of recipients) {
      const firstName = (p.full_name?.split(" ")[0]) || "there";
      if (body.dry_run) { sent++; continue; }
      try {
        const { error } = await resend.emails.send({
          from: "SwapSkills <hello@swap-skills.ie>",
          to: [p.email],
          subject: SUBJECT,
          html: renderEmail(firstName, featured),
        });
        if (error) { errors++; console.error("send err", p.email, error); }
        else sent++;
        await delay(900);
      } catch (e) {
        errors++; console.error("send fail", p.email, e);
      }
    }

    if (run) {
      await supabase.from("newsletter_runs").update({
        status: errors > 0 && sent === 0 ? "failed" : "sent",
        sent_count: sent,
        error_count: errors,
        completed_at: new Date().toISOString(),
      }).eq("id", run.id);
    }

    return new Response(JSON.stringify({ ok: true, segment, sent, errors, recipients: recipients.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    if (run) {
      await supabase.from("newsletter_runs").update({ status: "failed", notes: String(e?.message || e), completed_at: new Date().toISOString() }).eq("id", run.id);
    }
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
};

function renderEmail(firstName: string, featured: Array<{ url: string; title: string; description: string; category: string; location: string; image: string | null }>): string {
  const offersHtml = featured.map((s) => `
    <table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 16px 0;background:#fffefa;border:1px solid #f0ebe3;border-radius:12px;overflow:hidden;">
      ${s.image ? `<tr><td><a href="${s.url}"><img src="${s.image}" alt="${escapeHtml(s.title)}" style="display:block;width:100%;max-height:200px;object-fit:cover;border:0;"/></a></td></tr>` : ""}
      <tr><td style="padding:20px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:.5px;color:#f97316;font-weight:700;margin-bottom:6px;">${escapeHtml(s.category)} · ${escapeHtml(s.location)}</div>
        <h3 style="margin:0 0 8px 0;font-size:18px;color:#1f2937;"><a href="${s.url}" style="color:#1f2937;text-decoration:none;">${escapeHtml(s.title)}</a></h3>
        <p style="margin:0 0 14px 0;font-size:14px;line-height:1.6;color:#4b5563;">${escapeHtml(s.description)}${s.description.length >= 180 ? "…" : ""}</p>
        <a href="${s.url}" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600;">View swap</a>
      </td></tr>
    </table>
  `).join("");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Swap Skills</title></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#faf8f5;">
<table role="presentation" style="width:100%;border-collapse:collapse;"><tr><td align="center" style="padding:40px 16px;">
<table role="presentation" style="max-width:600px;width:100%;border-collapse:collapse;background:#fffefa;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
  <tr><td style="padding:32px 32px 16px;text-align:center;border-bottom:2px solid #f97316;">
    <h1 style="margin:0;font-size:26px;color:#f97316;letter-spacing:-.5px;">SwapSkills</h1>
    <p style="margin:6px 0 0;font-size:13px;color:#6b7280;">Ireland's skill sharing community</p>
  </td></tr>
  <tr><td style="padding:32px;">
    <h2 style="margin:0 0 12px;font-size:22px;color:#1f2937;">Hi ${escapeHtml(firstName)},</h2>
    <p style="margin:0 0 22px;font-size:16px;line-height:1.6;color:#4b5563;">Here are three brand-new skills neighbours across Ireland are offering right now. If anything sparks an idea, click through and start a conversation — no money needed, just a skill to trade.</p>
    ${offersHtml || `<p style="color:#6b7280;">No new offers this week — check back soon.</p>`}
    <div style="text-align:center;margin:28px 0;">
      <a href="${baseUrl}/browse" style="display:inline-block;background:#1f2937;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:600;">Browse all skills</a>
    </div>

    <!-- Feedback block -->
    <div style="background:linear-gradient(135deg,#fff7ed 0%,#ffedd5 100%);border:1px solid #fdba74;border-radius:12px;padding:24px;margin:24px 0;">
      <h3 style="margin:0 0 8px;font-size:18px;color:#9a3412;">Help shape what comes next</h3>
      <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#7c2d12;">What would make Swap Skills more useful for you? Share one quick improvement idea — it lands straight in my admin inbox.</p>
      <a href="${baseUrl}/newsletter-feedback" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-size:14px;font-weight:600;">Share a suggestion</a>
    </div>

    <p style="margin:24px 0 0;font-size:14px;color:#6b7280;">Or just hit reply — I read every message.</p>
    <p style="margin:20px 0 0;font-size:15px;color:#4b5563;">Thanks for being here,<br><strong style="color:#f97316;">Kris</strong></p>
  </td></tr>
  <tr><td style="background:#faf8f5;padding:20px 32px;text-align:center;border-top:1px solid #f0ebe3;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">You're receiving this because you have a Swap Skills account.</p>
    <p style="margin:8px 0 0;font-size:11px;color:#d1d5db;">© ${new Date().getFullYear()} SwapSkills · Made in Ireland</p>
  </td></tr>
</table></td></tr></table></body></html>`;
}

function escapeHtml(s: string): string {
  return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

serve(handler);