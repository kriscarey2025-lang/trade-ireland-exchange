import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AIMatchCard } from "@/components/matching/AIMatchCard";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, RefreshCw, AlertCircle, ArrowRight, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MatchesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
}

export function MatchesDialog({ open, onOpenChange, userId }: MatchesDialogProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ai-matches-dialog', userId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const response = await supabase.functions.invoke('skill-match', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data;
    },
    enabled: !!userId && open,
    staleTime: 5 * 60 * 1000
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if (!userId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <LogIn className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Sign in to see matches</h2>
            <p className="text-muted-foreground text-sm mb-5">
              Our AI finds people who want the skills you offer.
            </p>
            <Button asChild onClick={() => onOpenChange(false)}>
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const matchCount = data?.matches?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white mb-0.5">
                  {matchCount > 0 ? `${matchCount} People Want Your Skills! 🎉` : "Your Skill Matches"}
                </DialogTitle>
                <DialogDescription className="text-white/80 text-sm">
                  First movers are 3x more likely to complete a swap
                </DialogDescription>
              </div>
            </div>
            <Button 
              onClick={handleRefresh} 
              disabled={isLoading || isRefreshing} 
              variant="secondary" 
              size="sm" 
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 max-h-[60vh]">
          <div className="p-5 space-y-4">
            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Skeleton className="w-36 h-36 rounded-lg flex-shrink-0" />
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-5 w-2/3" />
                          <Skeleton className="h-16 w-full" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-8">
                <AlertCircle className="h-10 w-10 mx-auto text-destructive mb-3" />
                <h3 className="font-semibold mb-1">Something went wrong</h3>
                <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
                <Button onClick={handleRefresh} size="sm">Try Again</Button>
              </div>
            )}

            {/* Results */}
            {!isLoading && !error && data && (
              <>
                {data.matches && data.matches.length > 0 ? (
                  <div className="space-y-4">
                    {data.matches.map((match: any) => (
                      <AIMatchCard key={match.service_id} match={match} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Sparkles className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">{data.message || "No matches yet"}</h3>
                    <p className="text-sm text-muted-foreground mb-5">
                      Post a skill to start getting matched with people.
                    </p>
                    <Button asChild size="sm" onClick={() => onOpenChange(false)}>
                      <Link to="/services/new">
                        Post a Skill
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t px-5 py-3 flex justify-between items-center bg-muted/30">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="outline" size="sm" asChild onClick={() => onOpenChange(false)}>
            <Link to="/matches">
              View all matches
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
