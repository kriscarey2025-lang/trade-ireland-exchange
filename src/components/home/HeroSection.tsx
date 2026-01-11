import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Coffee, Sparkles, Lightbulb } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { BrainstormDialog } from "@/components/brainstorm/BrainstormDialog";

export function HeroSection() {
  const { user } = useAuth();
  const [brainstormOpen, setBrainstormOpen] = useState(false);
  
  return (
    <section className="relative overflow-hidden min-h-[65vh] md:min-h-[80vh] flex items-center pt-2 md:pt-0">
      {/* Warm animated background blobs - reduced size on mobile */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 md:-top-40 md:-right-40 w-48 h-48 md:w-96 md:h-96 bg-primary/15 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-20 md:-left-40 w-40 h-40 md:w-80 md:h-80 bg-accent/15 rounded-full blur-3xl animate-blob" style={{
          animationDelay: "3s"
        }} />
        <div className="absolute -bottom-10 right-1/4 w-36 h-36 md:w-72 md:h-72 bg-highlight/15 rounded-full blur-3xl animate-blob" style={{
          animationDelay: "6s"
        }} />
      </div>

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--border))_1px,transparent_0)] bg-[size:32px_32px]" />
      
      <div className="container relative px-4 md:px-6">
        <div className="py-6 md:py-20 text-center max-w-4xl mx-auto">
          {/* Friendly welcome badge - smaller on mobile */}
          <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-1.5 md:py-2.5 rounded-full bg-accent/10 text-accent text-xs md:text-sm font-semibold mb-3 md:mb-6 animate-fade-up border border-accent/20">
            <Heart className="h-3 w-3 md:h-4 md:w-4" />
            Welcome to our wee corner of the internet 🍀
          </div>

          {/* Warm, inviting headline - more compact on mobile */}
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2 md:mb-4">
            <span className="gradient-text inline-block opacity-0 animate-typeIn" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>Swap skills.</span>{" "}
            <span className="gradient-text inline-block opacity-0 animate-typeIn" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>Make friends.</span>{" "}
            <span className="text-foreground inline-block opacity-0 animate-slideFromRight" style={{ animationDelay: "0.9s", animationFillMode: "forwards" }}>Save money.</span>
          </h1>

          {/* Tagline - tighter spacing on mobile */}
          <p className="text-sm md:text-lg font-medium text-foreground mb-1 md:mb-3 animate-fade-up" style={{
            animationDelay: "0.15s"
          }}>
            A free, local platform for exchanging skills — no money involved.
          </p>

          {/* Ireland tagline - reduced margin */}
          <p className="text-xs md:text-sm font-medium tracking-wide mb-4 md:mb-8 animate-fade-up" style={{
            animationDelay: "0.22s"
          }}>
            <span className="inline-block bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent">Ireland's first digital & free Barter System</span>
          </p>
          
          {/* CTA Buttons - MOVED UP for mobile visibility above the fold */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 md:gap-4 mb-6 md:mb-10 animate-fade-up" style={{
            animationDelay: "0.25s"
          }}>
            <Button size="lg" className="group shadow-lg hover:shadow-xl rounded-full px-6 md:px-8 w-full sm:w-auto text-sm md:text-base h-11 md:h-12" asChild>
              <Link to={user ? "/new-service" : "/auth?mode=signup"}>
                {user ? "Start a Post" : "Sign up for free"}
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-6 md:px-8 w-full sm:w-auto text-sm md:text-base h-11 md:h-12" asChild>
              <Link to="/browse">
                See what's on offer
                <Coffee className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>


          {/* Brainstorm CTA - More compact on mobile */}
          <div className="animate-fade-up" style={{ animationDelay: "0.35s" }}>
            <button onClick={() => setBrainstormOpen(true)} className="group block max-w-md mx-auto w-full">
              <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-highlight/10 p-[1.5px] md:p-[2px] hover:from-primary/20 hover:via-accent/20 hover:to-highlight/20 transition-all duration-300">
                <div className="flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-4 rounded-xl md:rounded-2xl bg-card/95 backdrop-blur-sm group-hover:bg-card/90 transition-colors">
                  <div className="flex items-center justify-center w-7 h-7 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-accent animate-pulse">
                    <Lightbulb className="h-3.5 w-3.5 md:h-5 md:w-5 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-xs md:text-base text-foreground group-hover:text-primary transition-colors">
                      Not sure where to start?
                    </p>
                    <p className="text-[10px] md:text-sm text-muted-foreground">Let's brainstorm skill swap ideas!</p>
                  </div>
                  <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-accent group-hover:animate-spin transition-all" />
                </div>
              </div>
            </button>
          </div>
          
          {/* Quick social proof - mobile optimized */}
          <div className="mt-6 md:mt-8 flex items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-1.5">
              <span className="text-lg md:text-xl">🇮🇪</span>
              <span>100% Irish</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-lg md:text-xl">🤝</span>
              <span>100% Free</span>
            </div>
            <div className="w-px h-4 bg-border hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-lg md:text-xl">✨</span>
              <span>No Money Needed</span>
            </div>
          </div>
        </div>
      </div>
      <BrainstormDialog open={brainstormOpen} onOpenChange={setBrainstormOpen} />
    </section>
  );
}