import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, Shield, Zap } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-highlight/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: "2s" }} />
        <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: "4s" }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.5)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.5)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_40%,transparent_100%)]" />
      
      <div className="container relative">
        <div className="py-16 md:py-24 text-center max-w-5xl mx-auto">
          {/* Launch Badge - Fun animated */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-accent text-white text-sm font-bold mb-6 animate-fade-up shadow-lg hover-pop cursor-default">
            <Zap className="h-4 w-4 animate-pulse-soft" />
            🎉 NEW LAUNCH — FREE FOR THE FIRST YEAR!
          </div>

          {/* Secondary Badge */}
          <div className="flex justify-center mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-secondary border-2 border-primary/20 text-foreground text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              Ireland's First Skills Trading Community
              <span className="ml-1">🍀</span>
            </div>
          </div>

          {/* Headline - More playful */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 animate-fade-up font-display" style={{ animationDelay: "0.15s" }}>
            Trade Skills,
            <br />
            <span className="gradient-text">Not Money</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-up leading-relaxed" style={{ animationDelay: "0.25s" }}>
            Connect with neighbours across Ireland to exchange services. 
            Get your bathroom tiled, teach someone maths, or have your garden sorted — 
            <span className="font-semibold text-foreground"> all without spending a cent!</span>
          </p>

          {/* CTA Buttons - More prominent */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up" style={{ animationDelay: "0.35s" }}>
            <Button variant="hero" size="xl" className="group shadow-lg hover:shadow-xl" asChild>
              <Link to="/auth?mode=signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" className="hover:bg-secondary" asChild>
              <Link to="/browse">
                Browse Services
                <span className="ml-2">✨</span>
              </Link>
            </Button>
          </div>

          {/* Trust Indicators - Card style */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: "0.45s" }}>
            <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-card border border-border shadow-soft hover-lift">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Early Adopters Welcome</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-card border border-border shadow-soft hover-lift">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-success/10">
                <Shield className="h-5 w-5 text-success" />
              </div>
              <span className="text-sm font-medium">Verified Providers</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-card border border-border shadow-soft hover-lift">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <span className="text-sm font-medium">Free for 12 Months</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}