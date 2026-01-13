import { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface Review {
  review_text: string;
  user_rating: number;
  created_at: string;
  reviewer_name: string;
  reviewer_avatar: string | null;
}

export const ReviewsBanner = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          review_text,
          user_rating,
          created_at,
          reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url)
        `)
        .not("review_text", "is", null)
        .gte("user_rating", 4)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) {
        const formattedReviews = data.map((r: any) => ({
          review_text: r.review_text,
          user_rating: r.user_rating,
          created_at: r.created_at,
          reviewer_name: r.reviewer?.full_name || "Anonymous",
          reviewer_avatar: r.reviewer?.avatar_url || null,
        }));
        setReviews(formattedReviews);
      }
      setIsLoading(false);
    };

    fetchReviews();
  }, []);

  // Auto-rotate reviews every 6 seconds
  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  if (isLoading || reviews.length === 0) return null;

  const currentReview = reviews[currentIndex];
  const truncatedText = currentReview.review_text.length > 180 
    ? currentReview.review_text.substring(0, 180) + "..." 
    : currentReview.review_text;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IE", { day: "numeric", month: "short" });
  };

  return (
    <section className="py-3 bg-gradient-to-r from-accent/5 via-primary/5 to-accent/5 border-y border-border/50">
      <div className="container">
        <div className="flex items-center gap-4">
          {/* Label */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Recent Review
            </span>
          </div>

          <div className="hidden sm:block w-px h-8 bg-border" />

          {/* Review Content */}
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <Avatar className="h-8 w-8 shrink-0 border border-border">
              <AvatarImage src={currentReview.reviewer_avatar || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(currentReview.reviewer_name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Quote className="h-3 w-3 text-primary/60 shrink-0" />
                <p className="text-sm text-foreground truncate sm:whitespace-normal sm:line-clamp-1">
                  {truncatedText}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                — {currentReview.reviewer_name.split(" ")[0]} • {formatDate(currentReview.created_at)}
              </p>
            </div>
          </div>

          {/* Navigation */}
          {reviews.length > 1 && (
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={goToPrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground min-w-[3ch] text-center">
                {currentIndex + 1}/{reviews.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={goToNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* CTA */}
          <Button
            variant="outline"
            size="sm"
            className="hidden lg:inline-flex h-8 text-xs shrink-0"
            asChild
          >
            <Link to="/auth?mode=signup">
              Join the Community
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
