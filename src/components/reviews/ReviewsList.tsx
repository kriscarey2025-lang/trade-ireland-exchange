import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { formatDisplayName } from "@/lib/utils";

const TRUNCATE_LENGTH = 150;

function ExpandableText({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const needsTruncation = text.length > TRUNCATE_LENGTH;

  if (!needsTruncation) {
    return <p className="text-sm text-foreground">{text}</p>;
  }

  return (
    <div>
      <p className="text-sm text-foreground">
        {isExpanded ? text : `${text.slice(0, TRUNCATE_LENGTH)}...`}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs text-primary hover:underline mt-1"
      >
        {isExpanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}

interface ReviewsListProps {
  userId: string;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  );
}

export function ReviewsList({ userId }: ReviewsListProps) {
  const {
    data: reviews,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-reviews", userId],
    queryFn: async () => {
      const { data: rawReviews, error: reviewsError } = await supabase
        .from("reviews")
        .select(
          "id, created_at, reviewer_id, reviewed_user_id, service_id, user_rating, service_rating, review_text",
        )
        .eq("reviewed_user_id", userId)
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;
      if (!rawReviews || rawReviews.length === 0) return [];

      const reviewerIds = Array.from(
        new Set(rawReviews.map((r: any) => r.reviewer_id).filter(Boolean)),
      );
      const serviceIds = Array.from(
        new Set(rawReviews.map((r: any) => r.service_id).filter(Boolean)),
      );

      const [reviewersRes, servicesRes] = await Promise.all([
        reviewerIds.length
          ? supabase
              .from("profiles")
              .select("id, full_name, avatar_url")
              .in("id", reviewerIds)
          : Promise.resolve({ data: [], error: null }),
        serviceIds.length
          ? supabase.from("services").select("id, title").in("id", serviceIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (reviewersRes.error) throw reviewersRes.error;
      if (servicesRes.error) throw servicesRes.error;

      const reviewerMap = new Map(
        (reviewersRes.data || []).map((p: any) => [p.id, p]),
      );
      const serviceMap = new Map(
        (servicesRes.data || []).map((s: any) => [s.id, s]),
      );

      return (rawReviews || []).map((review: any) => ({
        ...review,
        reviewer: reviewerMap.get(review.reviewer_id) ?? null,
        service: review.service_id ? serviceMap.get(review.service_id) ?? null : null,
      }));
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No reviews yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const reviewer = review.reviewer as any;
        const service = review.service as any;
        
        return (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={reviewer?.avatar_url || undefined} />
                  <AvatarFallback>
                    {reviewer?.full_name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="font-medium text-sm">
                        {formatDisplayName(reviewer?.full_name)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Person:</span>
                      <StarDisplay rating={review.user_rating} />
                    </div>
                    {review.service_rating && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Service:</span>
                        <StarDisplay rating={review.service_rating} />
                      </div>
                    )}
                  </div>

                  {service?.title && (
                    <p className="text-xs text-muted-foreground mb-2">
                      For: {service.title}
                    </p>
                  )}

                  {review.review_text && (
                    <ExpandableText text={review.review_text} />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
