import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight, Plus, Lightbulb } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const FirstPostCTA = () => {
  const { user } = useAuth();

  // Fetch user's service count
  const { data: serviceCount = 0, isLoading } = useQuery({
    queryKey: ['user-service-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count, error } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Don't show if not logged in, still loading, or user already has posts
  if (!user || isLoading || serviceCount > 0) {
    return null;
  }

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <CardContent className="p-6 md:p-8 relative">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Icon */}
          <div className="shrink-0">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-primary-foreground" />
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-bold mb-2">
              Share your first skill! 🎉
            </h3>
            <p className="text-muted-foreground mb-1">
              You haven't posted a skill or service yet. Let your neighbours know what you can offer!
            </p>
            <p className="text-sm text-muted-foreground">
              <Lightbulb className="inline h-4 w-4 mr-1 text-amber-500" />
              Examples: Gardening, Tutoring, Dog Walking, IT Help, Baking, Language Lessons...
            </p>
          </div>
          
          {/* CTA */}
          <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
            <Button 
              size="lg" 
              className="group shadow-md hover:shadow-lg rounded-full px-6 font-semibold"
              asChild
            >
              <Link to="/new-service">
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Post
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Takes less than 2 minutes
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
