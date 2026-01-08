import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, PenLine, Sparkles, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const CTASection = forwardRef<HTMLElement>(function CTASection(_, ref) {
  const { user } = useAuth();
  return (
    <section ref={ref} className="py-16 md:py-28 relative overflow-hidden">
      {/* Warm gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-accent/80" />
      
      {/* Soft blobs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
      
      <div className="container relative text-center px-4">
        {/* Social proof badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-6 animate-fade-up">
          <Users className="h-4 w-4" />
          Join 25+ neighbours already swapping skills
          <Sparkles className="h-4 w-4" />
        </div>
        
        <h2 className="text-2xl md:text-5xl font-bold mb-4 md:mb-6 animate-fade-up text-white font-display">
          {user ? "Share your next skill!" : "Ready to give it a go?"}
        </h2>
        <p className="text-base md:text-lg text-white/90 max-w-xl mx-auto mb-8 md:mb-10 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          {user 
            ? "Post what you can offer or need help with — your neighbours are waiting!"
            : <>It's <span className="font-bold text-white underline decoration-white/50">completely free</span> — no hidden fees, no catch. Just neighbours helping neighbours.</>
          }
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/95 shadow-xl hover:shadow-2xl font-semibold rounded-full px-8 w-full sm:w-auto h-14 text-base"
            asChild
          >
            <Link to={user ? "/new-service" : "/auth?mode=signup"}>
              {user ? <PenLine className="mr-2 h-5 w-5" /> : <Heart className="mr-2 h-5 w-5" />}
              {user ? "Start a Post" : "Sign Up — It's Free!"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-2 border-white/50 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full px-8 w-full sm:w-auto"
            asChild
          >
            <Link to="/">{user ? "Browse more services" : "Have a look around first"}</Link>
          </Button>
        </div>
        
        {/* Trust signals for non-logged users */}
        {!user && (
          <p className="text-sm text-white/70 mt-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            ✓ No payment info needed · ✓ Unsubscribe anytime · ✓ Your data stays private
          </p>
        )}
        
        <p className="text-sm text-white/50 mt-6 md:mt-10 animate-fade-up" style={{ animationDelay: "0.4s" }}>
          Built with love in Killeshin, Carlow 🍀
        </p>
      </div>
    </section>
  );
});
