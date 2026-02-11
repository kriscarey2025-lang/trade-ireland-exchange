import { useState, useEffect, useRef, memo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Coffee, Sparkles, Lightbulb, Clock, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { BrainstormDialog } from "@/components/brainstorm/BrainstormDialog";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/use-mobile";
import { SupplyDemandDashboard } from "./SupplyDemandDashboard";

function HeroSectionComponent() {
  const { user } = useAuth();
  const [brainstormOpen, setBrainstormOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const trustpilotRef = useRef<HTMLDivElement>(null);

  // Manually load Trustpilot widget after React renders the element
  useEffect(() => {
    const el = trustpilotRef.current;
    if (!el) return;
    const w = window as any;
    if (w.Trustpilot) {
      w.Trustpilot.loadFromElement(el, true);
    }
  }, []);
  
  // Reduce animations on mobile for better performance
  const shouldAnimate = !prefersReducedMotion && !isMobile;
  
  return (
    <section className="relative overflow-hidden min-h-[40vh] md:min-h-[80vh] flex items-center pt-1 md:pt-0 contain-layout">
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
        <div className="py-2 md:py-12 max-w-5xl mx-auto">
          {/* Two column layout on desktop */}
          <div className="grid md:grid-cols-2 gap-4 md:gap-10 items-center">
            {/* Left column - Headlines and CTAs */}
            <div className="text-center md:text-left">
              {/* Friendly welcome badge - hidden on mobile */}
              <div className="hidden md:flex items-center gap-2 mb-2 md:mb-6 animate-fade-up">
                <a href="https://www.buymeacoffee.com/swapskills" target="_blank" rel="noopener noreferrer">
                  <img 
                    src="https://img.buymeacoffee.com/button-api/?text=Support Swap Skills&emoji=🤝&slug=swapskills&button_colour=f0740f&font_colour=000000&font_family=Bree&outline_colour=000000&coffee_colour=FFDD00" 
                    alt="Support Swap Skills on Buy Me a Coffee"
                    height="36"
                    width="217"
                    className="h-9"
                    loading="lazy"
                  />
                </a>
              </div>

              {/* Warm, inviting headline - more compact on mobile */}
              <h1 className="text-lg sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-1 md:mb-4">
                <span className="gradient-text inline-block opacity-0 animate-typeIn" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>Swap skills.</span>{" "}
                <span className="gradient-text inline-block opacity-0 animate-typeIn" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>Make friends.</span>{" "}
                <span className="text-foreground inline-block opacity-0 animate-slideFromRight" style={{ animationDelay: "0.9s", animationFillMode: "forwards" }}>Save money.</span>
              </h1>

              {/* Tagline - hidden on mobile */}
              <p className="hidden md:block text-xs md:text-lg font-medium text-foreground mb-0.5 md:mb-3 animate-fade-up" style={{
                animationDelay: "0.15s"
              }}>
                A free, local platform for exchanging skills — no money involved.
              </p>

              {/* Ireland tagline */}
              <p className="text-[9px] md:text-sm font-medium tracking-wide mb-2 md:mb-6 animate-fade-up" style={{
                animationDelay: "0.22s"
              }}>
                <span className="inline-block bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent">Ireland's first digital & free Barter System</span>
              </p>
              
              {/* CTA Buttons - compact on mobile */}
              <div className="flex flex-row items-center justify-center md:justify-start gap-2 mb-2 md:mb-6 animate-fade-up" style={{
                animationDelay: "0.25s"
              }}>
                <Button size="default" className="group shadow-lg hover:shadow-xl rounded-full px-4 md:px-8 text-[11px] md:text-base h-9 md:h-12" asChild>
                  <Link to={user ? "/new-service" : "/auth?mode=signup"}>
                    <Zap className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                    {user ? "Post in 60 sec" : "Join Free"}
                    <ArrowRight className="ml-1 h-3 w-3 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="default" 
                  className="rounded-full px-4 md:px-8 text-[11px] md:text-base h-9 md:h-12"
                  onClick={() => {
                    document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Browse
                  <Coffee className="ml-1 h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>

              {/* Trustpilot Review Box */}
              <div className="flex justify-center md:justify-start mb-2 md:mb-4 animate-fade-up" style={{ animationDelay: "0.27s" }}>
                <div 
                  ref={trustpilotRef}
                  className="trustpilot-widget" 
                  data-locale="en-US" 
                  data-template-id="56278e9abfbbba0bdcd568bc" 
                  data-businessunit-id="698afcf7c5b7f0ff5cd43437" 
                  data-style-height="52px" 
                  data-style-width="100%"
                  data-token="bb0aa621-6b7c-4584-a3ea-216a9ba2397e"
                >
                  <a href="https://www.trustpilot.com/review/swap-skills.com" target="_blank" rel="noopener">Trustpilot</a>
                </div>
              </div>

              {/* Speed promise badge - hidden on mobile */}
              <div className="hidden md:flex items-center justify-center md:justify-start gap-2 text-xs text-muted-foreground animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>No forms. No fees. Just share what you can do.</span>
              </div>

              {/* Brainstorm CTA - Hidden on mobile, shown on desktop */}
              <div className="hidden md:block mt-6 animate-fade-up" style={{ animationDelay: "0.35s" }}>
                <button onClick={() => setBrainstormOpen(true)} className="group block max-w-sm w-full text-left">
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-highlight/10 p-[2px] hover:from-primary/20 hover:via-accent/20 hover:to-highlight/20 transition-all duration-300">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card/95 backdrop-blur-sm group-hover:bg-card/90 transition-colors">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent">
                        <Lightbulb className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                          Not sure what to offer?
                        </p>
                        <p className="text-xs text-muted-foreground">Let AI help you brainstorm!</p>
                      </div>
                      <Sparkles className="h-4 w-4 text-accent group-hover:animate-spin transition-all flex-shrink-0" />
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Right column - Supply & Demand Dashboard */}
            <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <SupplyDemandDashboard />

              {/* Buy Me a Coffee - mobile only */}
              <div className="flex md:hidden justify-center mt-2 animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <a href="https://www.buymeacoffee.com/swapskills" target="_blank" rel="noopener noreferrer">
                  <img 
                    src="https://img.buymeacoffee.com/button-api/?text=Support Swap Skills&emoji=🤝&slug=swapskills&button_colour=f0740f&font_colour=000000&font_family=Bree&outline_colour=000000&coffee_colour=FFDD00" 
                    alt="Support Swap Skills on Buy Me a Coffee"
                    height="36"
                    width="217"
                    className="h-8"
                    loading="lazy"
                  />
                </a>
              </div>
              
              {/* Quick social proof - hidden on mobile */}
              <div className="hidden md:flex mt-4 items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🇮🇪</span>
                  <span>100% Irish</span>
                </div>
                <div className="w-px h-3 bg-border" />
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🤝</span>
                  <span>100% Free</span>
                </div>
                <div className="w-px h-3 bg-border" />
                <div className="flex items-center gap-1.5">
                  <span className="text-base">✨</span>
                  <span>No Money</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BrainstormDialog open={brainstormOpen} onOpenChange={setBrainstormOpen} />
    </section>
  );
}

export const HeroSection = memo(HeroSectionComponent);