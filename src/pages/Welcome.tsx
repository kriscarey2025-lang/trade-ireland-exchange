import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function Welcome() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user should see this page (just completed onboarding)
    const checkStatus = async () => {
      const { data } = await supabase
        .from("user_preferences")
        .select("onboarding_completed")
        .eq("user_id", user.id)
        .maybeSingle();

      // If onboarding not completed, send them there
      if (!data?.onboarding_completed) {
        navigate("/onboarding");
      }
    };

    checkStatus();
  }, [user, loading, navigate]);

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-hero flex items-center justify-center text-4xl mb-6 shadow-lg">
            🎉
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            You're All Set!
          </h1>
          <p className="text-lg text-muted-foreground">
            Welcome to SwapSkills. Here's what you can do next:
          </p>
        </div>

        {/* CTA Cards */}
        <div className="space-y-4">
          {/* Browse Services CTA */}
          <Card className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-0">
              <Link to="/browse" className="block">
                <div className="flex items-center gap-4 p-6">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Search className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold mb-1">
                      Contact Services That Interest You
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Browse skills offered by your neighbours and start swapping
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Post Service CTA */}
          <Card className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-0">
              <Link to="/new-service" className="block">
                <div className="flex items-center gap-4 p-6">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-accent/50 flex items-center justify-center">
                    <Plus className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold mb-1">
                      Post Your Service
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Share a skill you can offer and let others find you
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Skip option */}
        <div className="text-center mt-8">
          <Button
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => navigate("/")}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Explore the homepage first
          </Button>
        </div>
      </div>
    </div>
  );
}
