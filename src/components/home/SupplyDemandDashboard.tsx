import { memo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { categoryLabels, categoryIcons } from "@/lib/categories";
import { ServiceCategory } from "@/types";
import { TrendingUp, Users, HandHeart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryStats {
  category: string;
  offering: number;
  seeking: number;
}

type ViewMode = "offering" | "seeking";

function SupplyDemandDashboardComponent() {
  const [viewMode, setViewMode] = useState<ViewMode>("offering");
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ["supply-demand-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("category, type, accepted_categories")
        .eq("status", "active")
        .eq("moderation_status", "approved");

      if (error) throw error;

      // Aggregate: offering = what people offer, seeking = what people want in return
      const offeringMap: Record<string, number> = {};
      const seekingMap: Record<string, number> = {};
      
      data?.forEach((service) => {
        // Count offerings by category (skill_swap and free_offer are offerings)
        if (service.type === "skill_swap" || service.type === "free_offer" || service.type === "offer") {
          offeringMap[service.category] = (offeringMap[service.category] || 0) + 1;
        }
        
        // Count what people are seeking (from accepted_categories)
        if (service.accepted_categories && Array.isArray(service.accepted_categories)) {
          service.accepted_categories.forEach((cat: string) => {
            seekingMap[cat] = (seekingMap[cat] || 0) + 1;
          });
        }
      });

      // Merge into unified stats
      const allCategories = new Set([...Object.keys(offeringMap), ...Object.keys(seekingMap)]);
      return Array.from(allCategories).map(category => ({
        category,
        offering: offeringMap[category] || 0,
        seeking: seekingMap[category] || 0,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter and sort based on view mode - show 4 on mobile, 6 on desktop
  const filteredStats = stats
    ?.filter(s => viewMode === "offering" ? s.offering > 0 : s.seeking > 0)
    .sort((a, b) => viewMode === "offering" 
      ? b.offering - a.offering 
      : b.seeking - a.seeking
    ) || [];

  // Find opportunities for the callout
  const opportunities = stats?.filter(s => s.seeking > s.offering && s.seeking > 0) || [];

  // Fixed height skeleton to prevent CLS
  if (isLoading) {
    return (
      <div 
        className="bg-card/80 backdrop-blur-sm rounded-xl md:rounded-2xl border border-border/50 p-3 md:p-6"
        style={{ minHeight: '140px' }}
        aria-hidden="true"
      >
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 md:h-16 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // If no stats, still render container with min height to prevent CLS
  if (!stats || stats.length === 0) {
    return (
      <div 
        className="bg-card/80 backdrop-blur-sm rounded-xl md:rounded-2xl border border-border/50 p-3 md:p-6 text-center"
        style={{ minHeight: '140px' }}
      >
        <p className="text-muted-foreground text-sm py-8">No skills posted yet. Be the first!</p>
      </div>
    );
  }

  // Limit display on mobile vs desktop
  const displayStats = filteredStats.slice(0, 6);

  return (
    <div 
      className="bg-card/80 backdrop-blur-sm rounded-xl md:rounded-2xl border border-border/50 p-3 md:p-6 shadow-sm"
      style={{ minHeight: '140px' }}
    >
      {/* Header + Toggle combined for mobile */}
      <div className="flex items-center justify-between gap-2 mb-2 md:mb-3">
        <div className="hidden md:flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-sm md:text-base text-foreground">What's Available</h3>
        </div>
        
        {/* Toggle buttons - more compact on mobile */}
        <div className="flex items-center gap-1.5 md:gap-2 w-full md:w-auto">
          <button
            onClick={() => setViewMode("offering")}
            className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 md:py-2 rounded-lg border transition-all text-[11px] md:text-xs ${
              viewMode === "offering"
                ? "bg-primary/15 border-primary/30 text-primary"
                : "bg-muted/30 border-border/30 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <HandHeart className="h-3 w-3 md:h-3.5 md:w-3.5" />
            <span className="font-medium">Offered</span>
            <span className="opacity-70">({stats.reduce((sum, s) => sum + s.offering, 0)})</span>
          </button>
          <button
            onClick={() => setViewMode("seeking")}
            className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 md:py-2 rounded-lg border transition-all text-[11px] md:text-xs ${
              viewMode === "seeking"
                ? "bg-accent/15 border-accent/30 text-accent"
                : "bg-muted/30 border-border/30 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <Users className="h-3 w-3 md:h-3.5 md:w-3.5" />
            <span className="font-medium">Wanted</span>
            <span className="opacity-70">({stats.reduce((sum, s) => sum + s.seeking, 0)})</span>
          </button>
        </div>
      </div>

      {/* Stats Grid - 3 columns on mobile, compact cards */}
      {displayStats.length > 0 ? (
        <div className="grid grid-cols-3 gap-1.5 md:gap-3">
          {displayStats.map((item) => {
            const icon = categoryIcons[item.category as ServiceCategory] || "✨";
            const label = categoryLabels[item.category as ServiceCategory] || item.category;
            const count = viewMode === "offering" ? item.offering : item.seeking;
            
            return (
              <Link
                key={item.category}
                to={`/browse?category=${item.category}`}
                className="group relative overflow-hidden rounded-lg md:rounded-xl bg-muted/50 hover:bg-muted/80 p-2 md:p-3 transition-all hover:scale-[1.02] hover:shadow-md"
              >
                <div className="flex items-center gap-1 md:gap-0 md:flex-col md:items-start">
                  <span className="text-base md:text-lg">{icon}</span>
                  <p className="font-medium text-[10px] md:text-xs text-foreground truncate group-hover:text-primary transition-colors">
                    {label.split(' ')[0]}
                  </p>
                </div>
                <div className={`mt-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] md:text-[11px] font-semibold ${
                  viewMode === "offering" 
                    ? "bg-primary/15 text-primary" 
                    : "bg-accent/15 text-accent"
                }`}>
                  {count}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground text-xs">
          <p>No {viewMode === "offering" ? "offers" : "requests"} yet.</p>
        </div>
      )}
    </div>
  );
}

export const SupplyDemandDashboard = memo(SupplyDemandDashboardComponent);
