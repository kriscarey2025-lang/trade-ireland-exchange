import { useState, memo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Coffee, Sparkles, Lightbulb } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { BrainstormDialog } from "@/components/brainstorm/BrainstormDialog";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/use-mobile";

function HeroSectionComponent() {
  const { user } = useAuth();
  const [brainstormOpen, setBrainstormOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  
  // Reduce animations on mobile for better performance
  const shouldAnimate = !prefersReducedMotion && !isMobile;
  
  return (
    <section className="relative overflow-hidden min-h-[50vh] md:min-h-[80vh] flex items-center pt-2 md:pt-0 contain-layout">
      {/* Warm animated background blobs - only animate on desktop */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-20 -right-20 md:-top-40 md:-right-40 w-48 h-48 md:w-96 md:h-96 bg-primary/15 rounded-full blur-3xl ${shouldAnimate ? 'animate-blob' : ''}`} />
        <div 
          className={`absolute top-1/2 -left-20 md:-left-40 w-40 h-40 md:w-80 md:h-80 bg-accent/15 rounded-full blur-3xl ${shouldAnimate ? 'animate-blob' : ''}`} 
          style={shouldAnimate ? { animationDelay: "3s" } : undefined} 
        />
        <div 
          className={`absolute -bottom-10 right-1/4 w-36 h-36 md:w-72 md:h-72 bg-highlight/15 rounded-full blur-3xl ${shouldAnimate ? 'animate-blob' : ''}`} 
          style={shouldAnimate ? { animationDelay: "6s" } : undefined} 
        />
      </div>

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--border))_1px,transparent_0)] bg-[size:32px_32px]" />
      
      <div className="container relative px-4 md:px-6">
        <div className="py-4 md:py-20 text-center max-w-4xl mx-auto">
          {/* Friendly welcome badge - smaller on mobile */}
          <div className="inline-flex items-center gap-1 md:gap-2 px-2.5 md:px-5 py-1 md:py-2.5 rounded-full bg-accent/10 text-accent text-[10px] md:text-sm font-semibold mb-2 md:mb-6 animate-fade-up border border-accent/20">
            <Heart className="h-2.5 w-2.5 md:h-4 md:w-4" />
            Welcome to our wee corner of the internet 🍀
          </div>

          {/* Warm, inviting headline - more compact on mobile */}
          <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-1.5 md:mb-4">
            <span className="gradient-text inline-block opacity-0 animate-typeIn" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>Swap skills.</span>{" "}
            <span className="gradient-text inline-block opacity-0 animate-typeIn" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>Make friends.</span>{" "}
            <span className="text-foreground inline-block opacity-0 animate-slideFromRight" style={{ animationDelay: "0.9s", animationFillMode: "forwards" }}>Save money.</span>
          </h1>

          {/* Tagline - tighter spacing on mobile */}
          <p className="text-xs md:text-lg font-medium text-foreground mb-0.5 md:mb-3 animate-fade-up" style={{
            animationDelay: "0.15s"
          }}>
            A free, local platform for exchanging skills — no money involved.
          </p>

          {/* Ireland tagline - reduced margin */}
          <p className="text-[10px] md:text-sm font-medium tracking-wide mb-3 md:mb-8 animate-fade-up" style={{
            animationDelay: "0.22s"
          }}>
            <span className="inline-block bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent">Ireland's first digital & free Barter System</span>
          </p>
          
          {/* CTA Buttons - MOVED UP for mobile visibility above the fold */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-4 mb-4 md:mb-10 animate-fade-up" style={{
            animationDelay: "0.25s"
          }}>
            <Button size="lg" className="group shadow-lg hover:shadow-xl rounded-full px-5 md:px-8 w-full sm:w-auto text-xs md:text-base h-9 md:h-12" asChild>
              <Link to={user ? "/new-service" : "/auth?mode=signup"}>
                {user ? "Start a Post" : "Join the Community for Free"}
                <ArrowRight className="ml-1.5 md:ml-2 h-3.5 w-3.5 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full px-5 md:px-8 w-full sm:w-auto text-xs md:text-base h-9 md:h-12"
              onClick={() => {
                document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              See what's on offer
              <Coffee className="ml-1.5 md:ml-2 h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
          </div>


          {/* Brainstorm CTA - Hidden on mobile, shown on desktop */}
          <div className="hidden md:block animate-fade-up" style={{ animationDelay: "0.35s" }}>
            <button onClick={() => setBrainstormOpen(true)} className="group block max-w-md mx-auto w-full">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-highlight/10 p-[2px] hover:from-primary/20 hover:via-accent/20 hover:to-highlight/20 transition-all duration-300">
                <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-card/95 backdrop-blur-sm group-hover:bg-card/90 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent animate-pulse">
                    <Lightbulb className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                      Not sure where to start?
                    </p>
                    <p className="text-sm text-muted-foreground">Let's brainstorm skill swap ideas!</p>
                  </div>
                  <Sparkles className="h-5 w-5 text-accent group-hover:animate-spin transition-all" />
                </div>
              </div>
            </button>
          </div>
          
          {/* Quick social proof - hidden on mobile to save space */}
          <div className="hidden md:flex mt-8 items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-1.5">
              <span className="text-xl">🇮🇪</span>
              <span>100% Irish</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-xl">🤝</span>
              <span>100% Free</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-xl">✨</span>
              <span>No Money Needed</span>
            </div>
          </div>
        </div>
      </div>
      <BrainstormDialog open={brainstormOpen} onOpenChange={setBrainstormOpen} />
    </section>
  );
}

export const HeroSection = memo(HeroSectionComponent);