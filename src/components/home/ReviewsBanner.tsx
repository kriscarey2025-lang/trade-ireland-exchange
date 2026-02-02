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
      const { data, error } = await supabase.functions.invoke("public-reviews", {
        body: { limit: 5 },
      });

      if (error) {
        setIsLoading(false);
        return;
      }

      const payload = (data as any)?.reviews as Review[] | undefined;
      if (payload && payload.length > 0) {
        setReviews(payload);
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

  // Always render a placeholder to prevent CLS
  if (isLoading) {
    return (
      <section 
        className="py-3 bg-gradient-to-r from-accent/5 via-primary/5 to-accent/5 border-y border-border/50"
        style={{ minHeight: '52px' }}
        aria-hidden="true"
      >
        <div className="container">
          <div className="flex items-center gap-4 animate-pulse">
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-3 w-3 rounded-full bg-muted" />
                ))}
              </div>
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
            <div className="hidden sm:block w-px h-8 bg-border" />
            <div className="flex-1 flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // If no reviews, render an empty placeholder with same height to prevent CLS
  if (reviews.length === 0) {
    return <div style={{ minHeight: '0px' }} aria-hidden="true" />;
  }

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
    <section 
      className="py-3 bg-gradient-to-r from-accent/5 via-primary/5 to-accent/5 border-y border-border/50"
      style={{ minHeight: '52px' }}
    >
      <div className="container">
        <div className="flex items-center gap-4">
          {/* Label */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
              ))}
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Recent Review
            </span>
          </div>

          <div className="hidden sm:block w-px h-8 bg-border" aria-hidden="true" />

          {/* Review Content */}
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <Avatar className="h-8 w-8 shrink-0 border border-border">
              <AvatarImage src={currentReview.reviewer_avatar || undefined} alt={`${currentReview.reviewer_name}'s avatar`} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(currentReview.reviewer_name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Quote className="h-3 w-3 text-primary/60 shrink-0" aria-hidden="true" />
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
                aria-label="Previous review"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </Button>
              <span className="text-xs text-muted-foreground min-w-[3ch] text-center" aria-live="polite">
                {currentIndex + 1}/{reviews.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={goToNext}
                aria-label="Next review"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
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
