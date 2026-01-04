import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Handshake, 
  Clock, 
  ArrowRight, 
  CalendarIcon, 
  MessageCircle,
  ArrowLeftRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { categoryIcons, categoryLabels } from "@/lib/categories";
import { ServiceCategory } from "@/types";

interface PendingSwap {
  id: string;
  participant_1: string;
  participant_2: string;
  accepted_by_1: boolean;
  accepted_by_2: boolean;
  agreed_completion_date: string | null;
  swap_status: string;
  offered_skill: string | null;
  offered_skill_category: string | null;
  service_id: string | null;
  created_at: string;
  other_user: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  service?: {
    title: string;
  } | null;
}

interface PendingSwapRequestsCardProps {
  userId: string;
}

export function PendingSwapRequestsCard({ userId }: PendingSwapRequestsCardProps) {
  const [pendingSwaps, setPendingSwaps] = useState<PendingSwap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPendingSwaps() {
      // Fetch conversations where the user is a participant and swap is pending
      const { data: conversations, error } = await supabase
        .from("conversations")
        .select(`
          id,
          participant_1,
          participant_2,
          accepted_by_1,
          accepted_by_2,
          agreed_completion_date,
          swap_status,
          offered_skill,
          offered_skill_category,
          service_id,
          created_at
        `)
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .or('swap_status.eq.pending,and(accepted_by_1.eq.true,accepted_by_2.eq.false),and(accepted_by_1.eq.false,accepted_by_2.eq.true)')
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching pending swaps:", error);
        setLoading(false);
        return;
      }

      // Filter to only include swaps where at least one party has initiated
      const filteredConversations = (conversations || []).filter(conv => 
        (conv.accepted_by_1 || conv.accepted_by_2) && 
        !(conv.accepted_by_1 && conv.accepted_by_2) // Not both accepted
      );

      // Fetch other user's profile for each conversation
      const swapsWithProfiles: PendingSwap[] = [];
      
      for (const conv of filteredConversations) {
        const otherUserId = conv.participant_1 === userId ? conv.participant_2 : conv.participant_1;
        
        // Get basic profile using RPC function
        const { data: profileData } = await supabase
          .rpc('get_basic_profile', { _profile_id: otherUserId });

        // Get service title if available
        let serviceData = null;
        if (conv.service_id) {
          const { data: serviceResult } = await supabase
            .rpc('get_service_by_id', { _service_id: conv.service_id });
          serviceData = serviceResult?.[0];
        }

        swapsWithProfiles.push({
          ...conv,
          other_user: {
            id: otherUserId,
            full_name: profileData?.[0]?.full_name || null,
            avatar_url: profileData?.[0]?.avatar_url || null,
          },
          service: serviceData ? { title: serviceData.title } : null,
        });
      }

      setPendingSwaps(swapsWithProfiles);
      setLoading(false);
    }

    fetchPendingSwaps();
  }, [userId]);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getSwapType = (swap: PendingSwap): 'awaiting_response' | 'needs_response' => {
    const isParticipant1 = swap.participant_1 === userId;
    const userAccepted = isParticipant1 ? swap.accepted_by_1 : swap.accepted_by_2;
    
    return userAccepted ? 'awaiting_response' : 'needs_response';
  };

  if (loading) {
    return (
      <Card className="shadow-elevated border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (pendingSwaps.length === 0) {
    return null; // Don't show the card if no pending swaps
  }

  const needsResponse = pendingSwaps.filter(s => getSwapType(s) === 'needs_response');
  const awaitingResponse = pendingSwaps.filter(s => getSwapType(s) === 'awaiting_response');

  return (
    <Card className="shadow-elevated border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Handshake className="h-5 w-5 text-primary" />
          Pending Skill Swaps
          {pendingSwaps.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {pendingSwaps.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Skill trade requests waiting for action
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Needs Response Section */}
        {needsResponse.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Needs Your Response ({needsResponse.length})
            </h4>
            {needsResponse.map((swap) => (
              <SwapRequestItem key={swap.id} swap={swap} userId={userId} type="needs_response" />
            ))}
          </div>
        )}

        {/* Awaiting Response Section */}
        {awaitingResponse.length > 0 && (
          <div className="space-y-3">
            {needsResponse.length > 0 && <div className="border-t pt-4" />}
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Awaiting Their Response ({awaitingResponse.length})
            </h4>
            {awaitingResponse.map((swap) => (
              <SwapRequestItem key={swap.id} swap={swap} userId={userId} type="awaiting_response" />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SwapRequestItem({ 
  swap, 
  userId, 
  type 
}: { 
  swap: PendingSwap; 
  userId: string; 
  type: 'awaiting_response' | 'needs_response';
}) {
  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const categoryIcon = swap.offered_skill_category 
    ? categoryIcons[swap.offered_skill_category as ServiceCategory] || ""
    : "";

  return (
    <div className={`p-3 rounded-lg border ${
      type === 'needs_response' 
        ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20' 
        : 'border-muted bg-muted/30'
    }`}>
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={swap.other_user.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {getInitials(swap.other_user.full_name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm truncate">
              {swap.other_user.full_name || "Unknown User"}
            </span>
            {type === 'needs_response' && (
              <Badge variant="outline" className="text-xs border-orange-300 text-orange-600 dark:border-orange-700 dark:text-orange-400">
                Action Required
              </Badge>
            )}
          </div>
          
          {/* Swap Details */}
          {swap.offered_skill && (
            <p className="text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                {categoryIcon} {swap.offered_skill}
                {swap.service?.title && (
                  <>
                    <ArrowLeftRight className="h-3 w-3 mx-1" />
                    {swap.service.title}
                  </>
                )}
              </span>
            </p>
          )}
          
          {/* Date Info */}
          {swap.agreed_completion_date && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              Proposed: {format(new Date(swap.agreed_completion_date), 'dd MMM yyyy')}
            </p>
          )}
        </div>
        
        <Link to={`/messages/${swap.id}`}>
          <Button 
            size="sm" 
            variant={type === 'needs_response' ? 'default' : 'outline'}
            className="shrink-0"
          >
            <MessageCircle className="h-4 w-4 mr-1.5" />
            {type === 'needs_response' ? 'Respond' : 'View'}
          </Button>
        </Link>
      </div>
    </div>
  );
}
