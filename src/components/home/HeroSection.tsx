import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Users, Shield, Coffee } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Warm animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
        <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-highlight/15 rounded-full blur-3xl animate-blob" style={{ animationDelay: "6s" }} />
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
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Your neighbours have 
            <br />
            <span className="gradient-text">superpowers</span>
          </h1>

          {/* Conversational subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up leading-relaxed" style={{ animationDelay: "0.2s" }}>
            That lovely person down the road? Brilliant at tiling. 
            The retired teacher next door? Dying to help with homework. 
            <span className="font-semibold text-foreground"> Swap skills, make friends, save money.</span>
          </p>

          {/* Story snippet */}
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 mb-10 max-w-xl mx-auto border border-border/50 animate-fade-up cozy-shadow" style={{ animationDelay: "0.25s" }}>
            <p className="text-muted-foreground italic">
              "I taught Mary's kids piano, and she sorted my garden. We've become great friends — 
              <span className="text-foreground font-medium"> and neither of us spent a penny."</span>
            </p>
            <p className="text-sm text-primary mt-2 font-medium">— Siobhán, Cork</p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button size="lg" className="group shadow-lg hover:shadow-xl rounded-full px-8" asChild>
              <Link to="/auth?mode=signup">
                Join the Community
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

          {/* Trust Indicators - warm and friendly */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-card border border-border/50 cozy-shadow hover-lift">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Real neighbours</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-card border border-border/50 cozy-shadow hover-lift">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <span className="text-sm font-medium">ID verified</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-card border border-border/50 cozy-shadow hover-lift">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-highlight/10">
                <Heart className="h-5 w-5 text-highlight" />
              </div>
              <span className="text-sm font-medium">Free to join</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
