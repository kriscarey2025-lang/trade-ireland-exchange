import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Handshake, 
  Star, 
  ArrowRight, 
  X,
  AlertCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDisplayName } from "@/lib/utils";

interface PendingItem {
  id: string;
  type: 'swap_request' | 'pending_review';
  title: string;
  subtitle: string;
  link: string;
  urgent?: boolean;
}

export function ActionRequiredBanner() {
  const { user } = useAuth();
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchPendingActions() {
      const items: PendingItem[] = [];

      try {
        // Fetch pending swap requests (where user needs to respond)
        const { data: conversations } = await supabase
          .from("conversations")
          .select(`
            id,
            participant_1,
            participant_2,
            accepted_by_1,
            accepted_by_2,
            completed_by_1,
            completed_by_2,
            offered_skill,
            service_id
          `)
          .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`);

        if (conversations) {
          for (const conv of conversations) {
            const isParticipant1 = conv.participant_1 === user.id;
            const userAccepted = isParticipant1 ? conv.accepted_by_1 : conv.accepted_by_2;
            const otherAccepted = isParticipant1 ? conv.accepted_by_2 : conv.accepted_by_1;
            const userCompleted = isParticipant1 ? conv.completed_by_1 : conv.completed_by_2;
            const otherCompleted = isParticipant1 ? conv.completed_by_2 : conv.completed_by_1;

            // Check for swap requests needing response
            if (otherAccepted && !userAccepted) {
              items.push({
                id: conv.id,
                type: 'swap_request',
                title: 'Swap Request',
                subtitle: conv.offered_skill || 'New skill swap proposal',
                link: `/messages/${conv.id}`,
                urgent: true
              });
            }

            // Check for completed swaps needing review
            if (userCompleted && otherCompleted) {
              // Check if user has already left a review
              const { data: existingReview } = await supabase
                .from("reviews")
                .select("id")
                .eq("conversation_id", conv.id)
                .eq("reviewer_id", user.id)
                .maybeSingle();

              if (!existingReview) {
                const otherUserId = isParticipant1 ? conv.participant_2 : conv.participant_1;
                const { data: otherProfile } = await supabase
                  .rpc('get_basic_profile', { _profile_id: otherUserId });

                items.push({
                  id: `review-${conv.id}`,
                  type: 'pending_review',
                  title: 'Leave a Review',
                  subtitle: `Rate your swap with ${formatDisplayName(otherProfile?.[0]?.full_name) || 'your swap partner'}`,
                  link: `/messages/${conv.id}`,
                  urgent: false
                });
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching pending actions:", error);
      }

      setPendingItems(items);
      setLoading(false);
    }

    fetchPendingActions();
  }, [user]);

  if (!user || loading || pendingItems.length === 0 || dismissed) {
    return null;
  }

  const urgentItems = pendingItems.filter(item => item.urgent);
  const nonUrgentItems = pendingItems.filter(item => !item.urgent);

  return (
    <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-b border-primary/20">
      <div className="container py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 shrink-0">
              <div className="p-1.5 bg-primary/20 rounded-full">
                <AlertCircle className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                Action needed
              </span>
            </div>
            
            <div className="h-4 w-px bg-border shrink-0" />
            
            <div className="flex items-center gap-2">
              {/* Swap requests */}
              {urgentItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.link}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 hover:bg-orange-200 dark:hover:bg-orange-900/40 transition-colors shrink-0"
                >
                  <Handshake className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs font-medium text-orange-700 dark:text-orange-300 whitespace-nowrap">
                    {item.subtitle}
                  </span>
                  <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                    <Clock className="h-2.5 w-2.5 mr-0.5" />
                    Respond
                  </Badge>
                </Link>
              ))}
              
              {/* Pending reviews */}
              {nonUrgentItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.link}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-100 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-200 dark:hover:bg-yellow-900/40 transition-colors shrink-0"
                >
                  <Star className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300 whitespace-nowrap">
                    {item.subtitle}
                  </span>
                  <ArrowRight className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                </Link>
              ))}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 shrink-0"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
