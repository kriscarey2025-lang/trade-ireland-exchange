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
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Non-logged-in users - prompt to sign in
  if (!userId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle className="text-xl">AI Skill Matches</DialogTitle>
            </div>
            <DialogDescription>
              Get personalized matches based on your skills and preferences.
            </DialogDescription>
          </DialogHeader>
          <Card>
            <CardContent className="pt-6 text-center">
              <LogIn className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign in to see your matches</h2>
              <p className="text-muted-foreground mb-4">
                Our AI finds people who want the skills you offer.
              </p>
              <Button asChild onClick={() => onOpenChange(false)}>
                <Link to="/auth">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">People Want Your Skills! 🎉</DialogTitle>
          </div>
          <DialogDescription>
            Make the first move - just say hi! First movers are 3x more likely to complete a swap.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-between items-center">
          <Button onClick={handleRefresh} disabled={isLoading || isRefreshing} variant="outline" size="sm" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Finding...' : 'Refresh'}
          </Button>
          <Button variant="ghost" size="sm" asChild onClick={() => onOpenChange(false)}>
            <Link to="/matches" className="text-primary">
              View full page
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4 pb-4">
            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Skeleton className="w-32 h-32 rounded-lg" />
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-6 w-3/4" />
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
              <Card>
                <CardContent className="pt-6 text-center">
                  <AlertCircle className="h-10 w-10 mx-auto text-destructive mb-3" />
                  <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {error.message}
                  </p>
                  <Button onClick={handleRefresh} size="sm">Try Again</Button>
                </CardContent>
              </Card>
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
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Sparkles className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                      <h2 className="text-lg font-semibold mb-2">
                        {data.message || "No matches found yet"}
                      </h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create more services to get personalized AI matches.
                      </p>
                      <Button asChild size="sm" onClick={() => onOpenChange(false)}>
                        <Link to="/services/new">
                          Create a Service
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
