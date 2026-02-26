import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  review_text: string;
  user_rating: number;
  created_at: string;
  reviewer_name: string;
  reviewer_avatar: string | null;
}

export function ReviewsMarquee() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase.functions.invoke("public-reviews", {
        body: { limit: 10 },
      });
      if (!error) {
        const payload = (data as any)?.reviews as Review[] | undefined;
        if (payload && payload.length > 0) {
          const filtered = payload.filter((r) => {
            const t = r.review_text.toLowerCase();
            const n = r.reviewer_name.toLowerCase();
            return !t.includes("kris") && !t.includes("web design") && !t.includes("delia") && !n.includes("kris") && !n.includes("delia");
          });
          const pinIdx = filtered.findIndex((r) =>
            r.review_text.toLowerCase().includes("amy was absolutely brilliant")
          );
          if (pinIdx > 0) {
            const [pinned] = filtered.splice(pinIdx, 1);
            filtered.unshift(pinned);
          }
          setReviews(filtered);
        }
      }
      setIsLoading(false);
    };
    fetchReviews();
  }, []);

  if (isLoading) {
    return (
      <div
        className="w-full overflow-hidden bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-b border-border/50"
        style={{ minHeight: "38px" }}
        aria-hidden="true"
      />
    );
  }

  if (reviews.length === 0) return null;

  const renderStars = (rating: number) => (
    <span className="inline-flex gap-0.5 mr-1 align-middle">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3 w-3 ${
            s <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
          }`}
        />
      ))}
    </span>
  );

  // Build marquee content — duplicate for seamless loop
  const items = reviews.map((r, i) => (
    <span key={i} className="inline-flex items-center gap-2 whitespace-nowrap px-6">
      {renderStars(r.user_rating)}
      <span className="text-sm text-foreground italic">
        "{r.review_text.length > 100 ? r.review_text.slice(0, 100) + "…" : r.review_text}"
      </span>
      <span className="text-xs text-muted-foreground font-medium">
        — {r.reviewer_name}
      </span>
      <span className="text-muted-foreground/30 mx-2" aria-hidden="true">✦</span>
    </span>
  ));

  return (
    <div
      className="w-full overflow-hidden bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-b border-border/50"
      role="marquee"
      aria-label="Recent user reviews"
    >
      <div className="marquee-track flex items-center py-2">
        <div className="marquee-content">{items}</div>
        <div className="marquee-content" aria-hidden="true">{items}</div>
      </div>
    </div>
  );
}
