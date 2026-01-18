import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, MessageCircle, CheckCircle2, Activity } from "lucide-react";

export function SwapStatsSection() {
  // Fetch swap statistics using RPC function (bypasses RLS)
  const { data: swapStats } = useQuery({
    queryKey: ["swap-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_swap_stats");
      if (error) throw error;
      const stats = data?.[0];
      // Use minimum display values for social proof
      const realCompleted = stats?.completed_count || 0;
      const realInProgress = stats?.in_progress_count || 0;
      return {
        inProgress: Math.max(realInProgress, 4),
        completed: Math.max(realCompleted, 3),
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch message count using RPC function (bypasses RLS)
  const { data: messageCount } = useQuery({
    queryKey: ["message-count"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_message_count");
      if (error) throw error;
      // Use minimum display value for social proof
      return Math.max(data || 0, 23);
    },
    staleTime: 5 * 60 * 1000,
  });

  // Format today's date
  const formattedDate = new Date().toLocaleDateString("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="py-6 md:py-10 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container">
        <div className="flex flex-col items-center">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            <h3 className="text-sm md:text-base font-semibold text-foreground">
              What's happening as of {formattedDate}
            </h3>
          </div>
          
          {/* Stats pills - stacked on mobile, row on desktop */}
          <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-accent/10 border border-accent/20 min-w-[180px] justify-center">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">
                <span className="font-bold text-accent">{swapStats?.completed || 0}</span>{" "}
                <span className="text-muted-foreground">Swaps Completed</span>
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary/10 border border-primary/20 min-w-[180px] justify-center">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                <span className="font-bold text-primary">{swapStats?.inProgress || 0}</span>{" "}
                <span className="text-muted-foreground">Swaps in Progress</span>
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-highlight/10 border border-highlight/20 min-w-[180px] justify-center">
              <MessageCircle className="h-4 w-4 text-highlight" />
              <span className="text-sm font-medium">
                <span className="font-bold text-highlight">{messageCount || 0}</span>{" "}
                <span className="text-muted-foreground">Messages Sent</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
