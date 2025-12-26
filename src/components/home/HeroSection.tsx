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
          <div className="relative mb-10 max-w-xl mx-auto animate-fade-up" style={{ animationDelay: "0.25s" }}>
            {/* Gradient border wrapper */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/40 via-accent/30 to-highlight/40 blur-sm"></div>
            <div className="relative bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-xl rounded-3xl p-8 border border-border/30 shadow-xl overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/10 to-transparent rounded-tr-full"></div>
              
              {isLoading || !currentService ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-3 bg-muted rounded-full w-32 mx-auto"></div>
                  <div className="h-6 bg-muted rounded-full w-3/4 mx-auto"></div>
                  <div className="h-4 bg-muted rounded-full w-2/3 mx-auto"></div>
                  <div className="flex justify-center gap-3">
                    <div className="h-6 bg-muted rounded-full w-20"></div>
                    <div className="h-6 bg-muted rounded-full w-28"></div>
                  </div>
                </div>
              ) : (
                <Link 
                  to={`/services/${currentService.id}`}
                  className="block group relative z-10"
                  key={currentService.id}
                >
                  {/* Header badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Now Available</span>
                  </div>
                  
                  {/* Title with icon */}
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="text-3xl transform group-hover:scale-110 transition-transform duration-300">
                      {categoryIcons[currentService.category as ServiceCategory] || "✨"}
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
                      {currentService.title}
                    </h3>
                  </div>
                  
                  {/* Description */}
                  <p className="text-muted-foreground text-sm md:text-base line-clamp-2 mb-5 leading-relaxed max-w-md mx-auto">
                    <span className="italic">"{currentService.description}"</span>
                  </p>
                  
                  {/* Location and category tags */}
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground text-sm font-medium">
                      <MapPin className="h-3.5 w-3.5" />
                      {currentService.location}
                    </span>
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-sm font-semibold border border-primary/20">
                      {categoryLabels[currentService.category as ServiceCategory] || "Other"}
                    </span>
                  </div>
                  
                  {/* Progress indicator - pill style */}
                  <div className="flex justify-center items-center gap-2 mt-6">
                    {services.slice(0, Math.min(services.length, 8)).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentServiceIndex(idx);
                        }}
                        className={`h-2 rounded-full transition-all duration-500 ease-out ${
                          idx === currentServiceIndex 
                            ? "bg-gradient-to-r from-primary to-accent w-8 shadow-md shadow-primary/30" 
                            : "bg-muted-foreground/20 hover:bg-muted-foreground/40 w-2"
                        }`}
                        aria-label={`View service ${idx + 1}`}
                      />
                    ))}
                  </div>
                </Link>
              )}
            </div>
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