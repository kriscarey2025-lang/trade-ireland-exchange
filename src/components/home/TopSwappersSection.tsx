import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, MapPin, ArrowRight, Repeat } from "lucide-react";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import { FoundersBadge } from "@/components/profile/FoundersBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

interface TopSwapper {
  id: string;
  full_name: string;
  avatar_url: string | null;
  location: string | null;
  is_founder: boolean;
  verification_status: string;
  completed_swaps: number;
}

const rankIcons = [
  { icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { icon: Medal, color: "text-gray-400", bg: "bg-gray-400/10" },
  { icon: Award, color: "text-amber-600", bg: "bg-amber-600/10" },
];

export function TopSwappersSection() {
  const { user } = useAuth();

  const { data: topSwappers, isLoading } = useQuery({
    queryKey: ["top-swappers"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_top_swappers", {
        _limit: 5,
      });
      if (error) throw error;
      return (data as TopSwapper[]).filter((s) => s.completed_swaps > 0);
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Don't render if no swappers with completed swaps
  if (!isLoading && (!topSwappers || topSwappers.length === 0)) {
    return null;
  }

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatName = (name: string | null) => {
    if (!name) return "Anonymous";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  };

  return (
    <section className="py-6 md:py-10 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 md:p-2 rounded-lg bg-primary/10">
              <Trophy className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-bold">Top Swappers</h2>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                Most active community members
              </p>
            </div>
          </div>
          {!user && (
            <Button variant="ghost" size="sm" asChild className="text-xs md:text-sm">
              <Link to="/auth?mode=signup">
                Join them
                <ArrowRight className="ml-1 h-3 w-3 md:h-4 md:w-4" />
              </Link>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-3 md:p-4">
                  <div className="flex flex-col items-center gap-2">
                    <Skeleton className="h-12 w-12 md:h-16 md:w-16 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {topSwappers?.map((swapper, index) => {
              const RankIcon = rankIcons[index]?.icon || Award;
              const rankColor = rankIcons[index]?.color || "text-muted-foreground";
              const rankBg = rankIcons[index]?.bg || "bg-muted/50";

              return (
                <Link
                  key={swapper.id}
                  to={`/profile/${swapper.id}`}
                  className="group"
                >
                  <Card className="overflow-hidden hover:border-primary/50 transition-all duration-200 hover:shadow-md h-full">
                    <CardContent className="p-3 md:p-4">
                      <div className="flex flex-col items-center gap-2 text-center">
                        {/* Rank badge */}
                        <div
                          className={`absolute top-2 right-2 p-1 rounded-full ${rankBg}`}
                        >
                          <RankIcon className={`h-3 w-3 md:h-4 md:w-4 ${rankColor}`} />
                        </div>

                        {/* Avatar */}
                        <div className="relative">
                          <Avatar className="h-12 w-12 md:h-16 md:w-16 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                            <AvatarImage
                              src={swapper.avatar_url || undefined}
                              alt={swapper.full_name}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm md:text-lg font-semibold">
                              {getInitials(swapper.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          {index === 0 && (
                            <div className="absolute -top-1 -right-1 text-lg">👑</div>
                          )}
                        </div>

                        {/* Name and badges */}
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-xs md:text-sm truncate max-w-[100px] md:max-w-[120px] group-hover:text-primary transition-colors">
                              {formatName(swapper.full_name)}
                            </span>
                            <VerifiedBadge
                              status={swapper.verification_status as VerificationStatus}
                              size="sm"
                            />
                            {swapper.is_founder && <FoundersBadge size="sm" />}
                          </div>

                          {/* Location */}
                          {swapper.location && (
                            <div className="flex items-center gap-0.5 text-[10px] md:text-xs text-muted-foreground">
                              <MapPin className="h-2.5 w-2.5 md:h-3 md:w-3" />
                              <span className="truncate max-w-[80px]">
                                {swapper.location}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Swap count */}
                        <Badge
                          variant="secondary"
                          className="gap-1 text-[10px] md:text-xs font-medium bg-primary/10 text-primary border-0"
                        >
                          <Repeat className="h-2.5 w-2.5 md:h-3 md:w-3" />
                          {swapper.completed_swaps} swap
                          {swapper.completed_swaps !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
