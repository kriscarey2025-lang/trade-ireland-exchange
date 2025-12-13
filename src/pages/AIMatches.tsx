import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AIMatchCard } from "@/components/matching/AIMatchCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, RefreshCw, AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";

export default function AIMatches() {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ai-matches', user?.id],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('skill-match', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SEO 
          title="AI Skill Matching - SkillSwap Ireland"
          description="Get AI-powered skill match suggestions to find the perfect swap partners."
        />
        <Header />
        <main className="flex-1 container py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign in to see your matches</h2>
              <p className="text-muted-foreground mb-4">
                Get personalized AI-powered skill match suggestions.
              </p>
              <Button asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO 
        title="AI Skill Matching - SkillSwap Ireland"
        description="Get AI-powered skill match suggestions to find the perfect swap partners."
      />
      <Header />
      <main className="flex-1 container py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Powered Matching</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Your Perfect Skill Matches
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our AI analyzes your services, skill preferences, and location to find the best 
            potential swap partners within your preferred radius.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            <Link to="/onboarding" className="text-primary hover:underline">Update your preferences</Link> to improve your matches.
          </p>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center mb-8">
          <Button 
            onClick={handleRefresh} 
            disabled={isLoading || isRefreshing}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Finding matches...' : 'Refresh matches'}
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4 max-w-3xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Skeleton className="w-48 h-40 rounded-lg" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-20 w-full" />
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
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
              <p className="text-muted-foreground mb-4">
                {error.message}
              </p>
              <Button onClick={handleRefresh}>Try Again</Button>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {!isLoading && !error && data && (
          <div className="max-w-3xl mx-auto">
            {data.matches && data.matches.length > 0 ? (
              <div className="space-y-4">
                {data.matches.map((match: any) => (
                  <AIMatchCard key={match.service_id} match={match} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold mb-2">
                    {data.message || "No matches found yet"}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Create more services to get personalized AI matches, or check back later as more users join.
                  </p>
                  <Button asChild>
                    <Link to="/new-service">
                      Create a Service
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
