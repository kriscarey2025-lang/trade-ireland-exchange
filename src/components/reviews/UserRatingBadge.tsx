import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserRatingBadgeProps {
  userId: string;
  showCount?: boolean;
  size?: "sm" | "md";
}

export function UserRatingBadge({
  userId,
  showCount = true,
  size = "md",
}: UserRatingBadgeProps) {
  const { data: ratings } = useQuery({
    queryKey: ["user-ratings", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_user_ratings", { _user_id: userId });
      
      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!userId,
  });

  if (!ratings || ratings.total_reviews === 0) {
    return null;
  }

  const starSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={`flex items-center gap-1 ${textSize}`}>
      <Star className={`${starSize} fill-yellow-400 text-yellow-400`} />
      <span className="font-medium">{ratings.avg_user_rating}</span>
      {showCount && (
        <span className="text-muted-foreground">
          ({ratings.total_reviews} {ratings.total_reviews === 1 ? "review" : "reviews"})
        </span>
      )}
    </div>
  );
}
