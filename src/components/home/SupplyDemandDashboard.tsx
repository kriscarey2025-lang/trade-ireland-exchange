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

  // Filter and sort based on view mode
  const filteredStats = stats
    ?.filter(s => viewMode === "offering" ? s.offering > 0 : s.seeking > 0)
    .sort((a, b) => viewMode === "offering" 
      ? b.offering - a.offering 
      : b.seeking - a.seeking
    )
    .slice(0, 6) || [];

  // Find opportunities for the callout
  const opportunities = stats?.filter(s => s.seeking > s.offering && s.seeking > 0) || [];

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-sm md:text-base text-foreground">What's Available</h3>
        </div>
      </div>

      {/* Toggle - Clickable filter */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setViewMode("offering")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all ${
            viewMode === "offering"
              ? "bg-primary/15 border-primary/30 text-primary"
              : "bg-muted/30 border-border/30 text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <HandHeart className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Skills Offered</span>
          <span className="text-[10px] opacity-70">({stats.reduce((sum, s) => sum + s.offering, 0)})</span>
        </button>
        <button
          onClick={() => setViewMode("seeking")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all ${
            viewMode === "seeking"
              ? "bg-accent/15 border-accent/30 text-accent"
              : "bg-muted/30 border-border/30 text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Wanted in Return</span>
          <span className="text-[10px] opacity-70">({stats.reduce((sum, s) => sum + s.seeking, 0)})</span>
        </button>
      </div>

      {/* Stats Grid */}
      {filteredStats.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-4">
          {filteredStats.map((item) => {
            const icon = categoryIcons[item.category as ServiceCategory] || "✨";
            const label = categoryLabels[item.category as ServiceCategory] || item.category;
            const count = viewMode === "offering" ? item.offering : item.seeking;
            const hasOpportunity = viewMode === "seeking" && item.seeking > item.offering;
            
            return (
              <Link
                key={item.category}
                to={`/browse?category=${item.category}`}
                className="group relative overflow-hidden rounded-xl bg-muted/50 hover:bg-muted/80 p-3 transition-all hover:scale-[1.02] hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <span className="text-lg">{icon}</span>
                {hasOpportunity && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                      You could help!
                    </span>
                  )}
                </div>
                <p className="font-medium text-xs text-foreground truncate mb-1.5 group-hover:text-primary transition-colors">
                  {label}
                </p>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  viewMode === "offering" 
                    ? "bg-primary/15 text-primary" 
                    : "bg-accent/15 text-accent"
                }`}>
                  {viewMode === "offering" ? (
                    <HandHeart className="h-3 w-3" />
                  ) : (
                    <Users className="h-3 w-3" />
                  )}
                  {count} {viewMode === "offering" ? (count === 1 ? "offer" : "offers") : (count === 1 ? "request" : "requests")}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <p>No {viewMode === "offering" ? "offers" : "requests"} yet in any category.</p>
        </div>
      )}

      {/* Opportunity callout - show when viewing "Wanted" to encourage posting */}
      {viewMode === "seeking" && opportunities.length > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">You could help!</span>{" "}
            {opportunities.slice(0, 3).map(d => categoryLabels[d.category as ServiceCategory]).join(", ")} are in high demand
          </p>
        </div>
      )}
    </div>
  );
}

export const SupplyDemandDashboard = memo(SupplyDemandDashboardComponent);
