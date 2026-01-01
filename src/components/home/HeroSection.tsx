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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { data: services = [], isLoading } = useServices({ status: "active" });

  // Auto-rotate services every 5 seconds with animation
  useEffect(() => {
    if (services.length <= 1) return;
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentServiceIndex((prev) => (prev + 1) % services.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [services.length]);

  const handleDotClick = (idx: number) => {
    if (idx === currentServiceIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentServiceIndex(idx);
      setIsTransitioning(false);
    }, 300);
  };

  const currentService = services[currentServiceIndex];
  
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

          {/* Live Service Preview Carousel - more compact on mobile */}
          <div className="relative mb-6 md:mb-10 max-w-xl mx-auto animate-fade-up" style={{ animationDelay: "0.3s" }}>
            {/* Gradient border wrapper */}
            <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary/40 via-accent/30 to-highlight/40 blur-sm"></div>
            <div className="relative bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-8 border border-border/30 shadow-xl overflow-hidden">
              {/* Decorative elements - hidden on mobile */}
              <div className="hidden md:block absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full"></div>
              <div className="hidden md:block absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/10 to-transparent rounded-tr-full"></div>
              
              {isLoading || !currentService ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-3 bg-muted rounded-full w-32 mx-auto"></div>
                  <div className="h-5 bg-muted rounded-full w-3/4 mx-auto"></div>
                  <div className="h-4 bg-muted rounded-full w-2/3 mx-auto"></div>
                </div>
              ) : (
                <Link 
                  to={`/services/${currentService.id}`}
                  className="block group relative z-10"
                  key={currentService.id}
                >
                  {/* Animated content wrapper */}
                  <div 
                    className={`transition-all duration-300 ease-out ${
                      isTransitioning 
                        ? "opacity-0 translate-y-4 scale-95" 
                        : "opacity-100 translate-y-0 scale-100"
                    }`}
                  >
                    {/* Header badge */}
                    <div className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-primary/10 border border-primary/20 mb-2 md:mb-4">
                      <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-primary"></span>
                      </span>
                      <span className="text-[10px] md:text-xs font-semibold text-primary uppercase tracking-wider">Now Available</span>
                    </div>
                    
                    {/* Title with icon */}
                    <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-4">
                      <span className="text-xl md:text-3xl transform group-hover:scale-110 transition-transform duration-300">
                        {categoryIcons[currentService.category as ServiceCategory] || "✨"}
                      </span>
                      <h3 className="text-base md:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
                        {currentService.title}
                      </h3>
                    </div>
                    
                    {/* Description - hidden on small mobile */}
                    <p className="hidden sm:block text-muted-foreground text-xs md:text-base line-clamp-2 mb-3 md:mb-5 leading-relaxed max-w-md mx-auto">
                      <span className="italic">"{currentService.description}"</span>
                    </p>
                    
                    {/* Location and category tags */}
                    <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-muted/50 text-muted-foreground text-xs md:text-sm font-medium">
                        <MapPin className="h-3 w-3 md:h-3.5 md:w-3.5" />
                        {currentService.location}
                      </span>
                      <span className="px-2.5 md:px-4 py-1 md:py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-xs md:text-sm font-semibold border border-primary/20">
                        {categoryLabels[currentService.category as ServiceCategory] || "Other"}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress indicator - pill style */}
                  <div className="flex justify-center items-center gap-1.5 md:gap-2 mt-4 md:mt-6">
                    {services.slice(0, Math.min(services.length, 6)).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.preventDefault();
                          handleDotClick(idx);
                        }}
                        className={`h-1.5 md:h-2 rounded-full transition-all duration-500 ease-out ${
                          idx === currentServiceIndex 
                            ? "bg-gradient-to-r from-primary to-accent w-5 md:w-8 shadow-md shadow-primary/30" 
                            : "bg-muted-foreground/20 hover:bg-muted-foreground/40 w-1.5 md:w-2"
                        }`}
                        aria-label={`View service ${idx + 1}`}
                      />
                    ))}
                  </div>
                </Link>
              )}
            </div>
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
              <span>Free Forever</span>
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