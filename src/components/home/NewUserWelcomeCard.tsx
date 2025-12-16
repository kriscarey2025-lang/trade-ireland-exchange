import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function NewUserWelcomeCard() {
  const { user } = useAuth();
  const [hasServices, setHasServices] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) {
      setHasServices(null);
      return;
    }

    const checkUserServices = async () => {
      const { count } = await supabase
        .from("services")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setHasServices((count ?? 0) > 0);
    };

    checkUserServices();
  }, [user]);

  // Don't show if: not logged in, already has services, dismissed, or still loading
  if (!user || hasServices !== false || dismissed) {
    return null;
  }

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-2 border-primary/20 shadow-xl">
          {/* Dismiss button */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

          <div className="relative p-8 md:p-10 text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>

            {/* Content */}
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Welcome to SwapSkills! 🎉
            </h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              You're all set up! Now it's time to share what you can offer or find help with something you need. 
              Create your first post and start connecting with your community.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 group">
                <Link to="/new-service">
                  Create Your First Post
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/browse">
                  Browse Available Swaps
                </Link>
              </Button>
            </div>

            {/* Hint text */}
            <p className="mt-6 text-sm text-muted-foreground">
              💡 Tip: You can offer a skill, request help, or propose a skill swap!
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
