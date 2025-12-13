import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

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
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["user-reviews", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          reviewer:reviewer_id (
            id,
            full_name,
            avatar_url
          ),
          service:service_id (
            title
          )
        `)
        .eq("reviewed_user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
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
                        {reviewer?.full_name || "Anonymous"}
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
                    <p className="text-sm text-foreground">
                      {review.review_text}
                    </p>
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
