import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface RequestBody {
  limit?: number;
}

type PublicReview = {
  review_text: string;
  user_rating: number;
  created_at: string;
  reviewer_name: string;
  reviewer_avatar: string | null;
};

function firstNameOnly(fullName: string | null): string {
  const name = (fullName || "Anonymous").trim();
  const first = name.split(/\s+/)[0];
  return first || "Anonymous";
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let limit = 5;
    try {
      const body: RequestBody = await req.json();
      if (typeof body.limit === "number" && body.limit > 0 && body.limit <= 20) {
        limit = body.limit;
      }
    } catch {
      // ignore missing/invalid JSON
    }

    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("review_text, user_rating, created_at, reviewer_id")
      .not("review_text", "is", null)
      .gte("user_rating", 4)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (reviewsError) throw reviewsError;

    if (!reviews || reviews.length === 0) {
      return new Response(JSON.stringify({ reviews: [] satisfies PublicReview[] }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const reviewerIds = Array.from(new Set(reviews.map((r) => r.reviewer_id)));

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", reviewerIds);

    if (profilesError) throw profilesError;

    const profilesMap = new Map((profiles || []).map((p) => [p.id, p] as const));

    const payload: PublicReview[] = reviews.map((r) => {
      const profile = profilesMap.get(r.reviewer_id);
      return {
        review_text: r.review_text ?? "",
        user_rating: r.user_rating ?? 5,
        created_at: r.created_at,
        reviewer_name: firstNameOnly(profile?.full_name ?? null),
        reviewer_avatar: profile?.avatar_url ?? null,
      };
    });

    return new Response(JSON.stringify({ reviews: payload }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("public-reviews error:", error);
    return new Response(JSON.stringify({ error: error?.message ?? "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
