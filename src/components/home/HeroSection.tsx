import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Coffee, Sparkles, Lightbulb, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { BrainstormDialog } from "@/components/brainstorm/BrainstormDialog";
import { useServices } from "@/hooks/useServices";
import { categoryLabels, categoryIcons } from "@/lib/categories";
import { ServiceCategory } from "@/types";

export function HeroSection() {
  const { user } = useAuth();
  const [brainstormOpen, setBrainstormOpen] = useState(false);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const { data: services = [], isLoading } = useServices({ status: "active" });

  // Auto-rotate services every 5 seconds
  useEffect(() => {
    if (services.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentServiceIndex((prev) => (prev + 1) % services.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [services.length]);

  const currentService = services[currentServiceIndex];
  return <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Warm animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-blob" style={{
        animationDelay: "3s"
      }} />
        <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-highlight/15 rounded-full blur-3xl animate-blob" style={{
        animationDelay: "6s"
      }} />
      </div>

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--border))_1px,transparent_0)] bg-[size:32px_32px]" />
      
      <div className="container relative">
        <div className="py-16 md:py-24 text-center max-w-4xl mx-auto">
          {/* Friendly welcome badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-6 animate-fade-up border border-accent/20">
            <Heart className="h-4 w-4" />
            Welcome to our wee corner of the internet 🍀
          </div>

          {/* Warm, inviting headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="gradient-text inline-block opacity-0 animate-typeIn" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>Swap skills.</span>{" "}
            <span className="gradient-text inline-block opacity-0 animate-typeIn" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}>Make friends.</span>{" "}
            <span className="text-foreground inline-block opacity-0 animate-slideFromRight" style={{ animationDelay: "1.1s", animationFillMode: "forwards" }}>Save money.</span>
          </h1>

          {/* Tagline */}
          <p className="text-lg md:text-xl font-medium text-foreground mb-4 animate-fade-up" style={{
          animationDelay: "0.15s"
        }}>
            A free, local platform for exchanging skills — no money involved.
          </p>

          {/* Conversational subheadline */}
          

          {/* Ireland tagline */}
          <p className="text-sm md:text-base font-medium tracking-wide mb-12 animate-fade-up" style={{
          animationDelay: "0.22s"
        }}>
            <span className="inline-block bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent animate-spin-slow">Ireland's first digital & free Barter System </span>
          </p>

          {/* Live Service Preview Carousel */}
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 mb-10 max-w-xl mx-auto border border-border/50 animate-fade-up cozy-shadow relative overflow-hidden" style={{
          animationDelay: "0.25s"
        }}>
            {isLoading || !currentService ? (
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mx-auto mb-3"></div>
                <div className="h-5 bg-muted rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
              </div>
            ) : (
              <Link 
                to={`/service/${currentService.id}`}
                className="block group transition-all duration-300"
                key={currentService.id}
              >
                <p className="text-xs text-muted-foreground/70 uppercase tracking-wide mb-2">
                  Now Available on SwapSkills
                </p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-xl">
                    {categoryIcons[currentService.category as ServiceCategory] || "✨"}
                  </span>
                  <p className="text-foreground font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                    {currentService.title}
                  </p>
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-3 italic">
                  "{currentService.description}"
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {currentService.location}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    {categoryLabels[currentService.category as ServiceCategory] || "Other"}
                  </span>
                </div>
                {/* Progress indicator */}
                <div className="flex justify-center gap-1.5 mt-4">
                  {services.slice(0, Math.min(services.length, 8)).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentServiceIndex(idx);
                      }}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        idx === currentServiceIndex 
                          ? "bg-primary w-6" 
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      }`}
                      aria-label={`View service ${idx + 1}`}
                    />
                  ))}
                </div>
              </Link>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 animate-fade-up" style={{
          animationDelay: "0.3s"
        }}>
            <Button size="lg" className="group shadow-lg hover:shadow-xl rounded-full px-8" asChild>
              <Link to={user ? "/new-service" : "/auth?mode=signup"}>
                {user ? "Start a Post" : "Join the Community"}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-8" asChild>
              <Link to="/browse">
                See what's on offer
                <Coffee className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Brainstorm CTA - Standout Card */}
          <div className="mb-14 animate-fade-up" style={{
          animationDelay: "0.35s"
        }}>
            <button onClick={() => setBrainstormOpen(true)} className="group block max-w-md mx-auto w-full">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-highlight/10 p-[2px] hover:from-primary/20 hover:via-accent/20 hover:to-highlight/20 transition-all duration-300">
                <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-card/95 backdrop-blur-sm group-hover:bg-card/90 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent animate-pulse">
                    <Lightbulb className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      Not sure where to start?
                    </p>
                    <p className="text-sm text-muted-foreground">Let's brainstorm skill swap ideas !</p>
                  </div>
                  <Sparkles className="h-5 w-5 text-accent group-hover:animate-spin transition-all" />
                </div>
              </div>
            </button>
          </div>

          {/* Trust Indicators - warm and friendly */}
          
        </div>
      </div>
      <BrainstormDialog open={brainstormOpen} onOpenChange={setBrainstormOpen} />
    </section>;
}