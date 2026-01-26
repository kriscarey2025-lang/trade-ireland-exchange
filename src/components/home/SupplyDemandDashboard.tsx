import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { categoryLabels, categoryIcons } from "@/lib/categories";
import { ServiceCategory } from "@/types";
import { TrendingUp, TrendingDown, Users, HandHeart } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryStats {
  category: string;
  offering: number;
  seeking: number;
}

function SupplyDemandDashboardComponent() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["supply-demand-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("category, type")
        .eq("status", "active")
        .eq("moderation_status", "approved");

      if (error) throw error;

      // Aggregate by category
      const categoryMap: Record<string, { offering: number; seeking: number }> = {};
      
      data?.forEach((service) => {
        if (!categoryMap[service.category]) {
          categoryMap[service.category] = { offering: 0, seeking: 0 };
        }
        if (service.type === "help_request") {
          categoryMap[service.category].seeking++;
        } else {
          categoryMap[service.category].offering++;
        }
      });

      // Convert to array and sort
      return Object.entries(categoryMap)
        .map(([category, counts]) => ({
          category,
          ...counts,
        }))
        .sort((a, b) => (b.offering + b.seeking) - (a.offering + a.seeking))
        .slice(0, 6);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Find opportunities: categories with high demand but low supply
  const opportunities = stats?.filter(s => s.seeking > s.offering) || [];
  const inDemand = stats?.filter(s => s.seeking > 0) || [];

  if (isLoading) {
    return (
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-4 md:p-6 animate-fade-up">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats || stats.length === 0) {
    return null;
  }

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-4 md:p-6 animate-fade-up shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-sm md:text-base text-foreground">Supply & Demand</h3>
        </div>
        <p className="text-xs text-muted-foreground">What's being offered vs. requested</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-4">
        {stats.map((item) => {
          const icon = categoryIcons[item.category as ServiceCategory] || "✨";
          const label = categoryLabels[item.category as ServiceCategory] || item.category;
          const hasGap = item.seeking > item.offering;
          
          return (
            <Link
              key={item.category}
              to={`/browse?category=${item.category}`}
              className="group relative overflow-hidden rounded-xl bg-muted/50 hover:bg-muted/80 p-3 transition-all hover:scale-[1.02] hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-1.5">
                <span className="text-lg">{icon}</span>
                {hasGap && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning/20 text-warning font-medium">
                    Needed!
                  </span>
                )}
              </div>
              <p className="font-medium text-xs text-foreground truncate mb-1 group-hover:text-primary transition-colors">
                {label}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <HandHeart className="h-3 w-3 text-primary" />
                  {item.offering}
                </span>
                <span className="flex items-center gap-0.5">
                  <Users className="h-3 w-3 text-accent" />
                  {item.seeking}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Opportunity callout */}
      {inDemand.length > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-accent/10 to-highlight/10 border border-accent/20">
          <TrendingDown className="h-4 w-4 text-accent flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">People are looking for:</span>{" "}
            {inDemand.map(d => categoryLabels[d.category as ServiceCategory]).join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}

export const SupplyDemandDashboard = memo(SupplyDemandDashboardComponent);
