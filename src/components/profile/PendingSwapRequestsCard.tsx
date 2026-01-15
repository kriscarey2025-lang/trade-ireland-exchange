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
  CalendarIcon, 
  MessageCircle,
  ArrowLeftRight,
  CheckCircle2,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { categoryIcons } from "@/lib/categories";
import { ServiceCategory } from "@/types";
import { formatDisplayName } from "@/lib/utils";

interface SwapConversation {
  id: string;
  participant_1: string;
  participant_2: string;
  accepted_by_1: boolean;
  accepted_by_2: boolean;
  completed_by_1: boolean;
  completed_by_2: boolean;
  agreed_completion_date: string | null;
  swap_status: string;
  offered_skill: string | null;
  offered_skill_category: string | null;
  service_id: string | null;
  created_at: string;
  accepted_at: string | null;
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
  const [swaps, setSwaps] = useState<SwapConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSwaps() {
      // Fetch all conversations where the user is a participant and swap has some activity
      const { data: conversations, error } = await supabase
        .from("conversations")
        .select(`
          id,
          participant_1,
          participant_2,
          accepted_by_1,
          accepted_by_2,
          completed_by_1,
          completed_by_2,
          agreed_completion_date,
          swap_status,
          offered_skill,
          offered_skill_category,
          service_id,
          created_at,
          accepted_at
        `)
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching swaps:", error);
        setLoading(false);
        return;
      }

      // Filter to only include swaps where at least one party has initiated
      // and exclude fully completed swaps
      const filteredConversations = (conversations || []).filter(conv => {
        const hasActivity = conv.accepted_by_1 || conv.accepted_by_2;
        const isFullyCompleted = conv.completed_by_1 && conv.completed_by_2;
        return hasActivity && !isFullyCompleted;
      });

      // Fetch other user's profile for each conversation
      const swapsWithProfiles: SwapConversation[] = [];
      
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

      setSwaps(swapsWithProfiles);
      setLoading(false);
    }

    fetchSwaps();
  }, [userId]);

  const getSwapType = (swap: SwapConversation): 'active' | 'awaiting_response' | 'needs_response' => {
    const bothAccepted = swap.accepted_by_1 && swap.accepted_by_2;
    
    if (bothAccepted) {
      return 'active';
    }
    
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

  if (swaps.length === 0) {
    return null;
  }

  const activeSwaps = swaps.filter(s => getSwapType(s) === 'active');
  const needsResponse = swaps.filter(s => getSwapType(s) === 'needs_response');
  const awaitingResponse = swaps.filter(s => getSwapType(s) === 'awaiting_response');

  return (
    <Card className="shadow-elevated border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Handshake className="h-5 w-5 text-primary" />
          Skill Swaps
          {swaps.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {swaps.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Active and pending skill trade requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Swaps Section */}
        {activeSwaps.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1.5">
              <Zap className="h-4 w-4" />
              Active Swaps ({activeSwaps.length})
            </h4>
            {activeSwaps.map((swap) => (
              <SwapRequestItem key={swap.id} swap={swap} userId={userId} type="active" />
            ))}
          </div>
        )}

        {/* Needs Response Section */}
        {needsResponse.length > 0 && (
          <div className="space-y-3">
            {activeSwaps.length > 0 && <div className="border-t pt-4" />}
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
            {(activeSwaps.length > 0 || needsResponse.length > 0) && <div className="border-t pt-4" />}
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
  swap: SwapConversation; 
  userId: string; 
  type: 'active' | 'awaiting_response' | 'needs_response';
}) {
  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const categoryIcon = swap.offered_skill_category 
    ? categoryIcons[swap.offered_skill_category as ServiceCategory] || ""
    : "";

  // Check completion status for active swaps
  const isParticipant1 = swap.participant_1 === userId;
  const userCompleted = isParticipant1 ? swap.completed_by_1 : swap.completed_by_2;
  const otherCompleted = isParticipant1 ? swap.completed_by_2 : swap.completed_by_1;

  const getBorderClasses = () => {
    switch (type) {
      case 'active':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20';
      case 'needs_response':
        return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20';
      default:
        return 'border-muted bg-muted/30';
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getBorderClasses()}`}>
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
              {formatDisplayName(swap.other_user.full_name)}
            </span>
            {type === 'active' && (
              <Badge variant="outline" className="text-xs border-green-300 text-green-600 dark:border-green-700 dark:text-green-400">
                <Zap className="h-3 w-3 mr-1" />
                In Progress
              </Badge>
            )}
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
          
          {/* Completion Status for Active Swaps */}
          {type === 'active' && (
            <div className="flex items-center gap-3 text-xs">
              <span className={`flex items-center gap-1 ${userCompleted ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                <CheckCircle2 className="h-3 w-3" />
                You: {userCompleted ? 'Done' : 'Pending'}
              </span>
              <span className={`flex items-center gap-1 ${otherCompleted ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                <CheckCircle2 className="h-3 w-3" />
                Them: {otherCompleted ? 'Done' : 'Pending'}
              </span>
            </div>
          )}
          
          {/* Date Info */}
          {swap.agreed_completion_date && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {type === 'active' ? 'Due' : 'Proposed'}: {format(new Date(swap.agreed_completion_date), 'dd MMM yyyy')}
            </p>
          )}
        </div>
        
        <Link to={`/messages/${swap.id}`}>
          <Button 
            size="sm" 
            variant={type === 'needs_response' ? 'default' : type === 'active' ? 'secondary' : 'outline'}
            className="shrink-0"
          >
            <MessageCircle className="h-4 w-4 mr-1.5" />
            {type === 'needs_response' ? 'Respond' : type === 'active' ? 'Open' : 'View'}
          </Button>
        </Link>
      </div>
    </div>
  );
}
