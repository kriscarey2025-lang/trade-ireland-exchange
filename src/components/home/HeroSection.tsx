import { useState, useEffect, useRef, memo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Coffee, Zap, MapPin, BookOpen, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/use-mobile";

function HeroSectionComponent() {
  const { user } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const trustpilotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trustpilotRef.current;
    if (!el) return;
    const w = window as any;
    if (w.Trustpilot) {
      w.Trustpilot.loadFromElement(el, true);
    }
  }, []);

  const shouldAnimate = !prefersReducedMotion && !isMobile;

  const quickLinks = [
    {
      icon: BookOpen,
      label: "Skill Guides",
      description: "Fun facts & local listings",
      to: "/skills",
      emoji: "📚",
    },
    {
      icon: MapPin,
      label: "County Spotlights",
      description: "Explore skills by county",
      to: "/county",
      emoji: "🇮🇪",
    },
    {
      icon: Star,
      label: "Review Us",
      description: "Share your experience",
      to: "https://www.trustpilot.com/review/swap-skills.com",
      external: true,
      emoji: "⭐",
    },
  ];

  return (
    <section className="relative overflow-hidden min-h-[38vh] md:min-h-[75vh] flex items-center pt-1 md:pt-0 contain-layout">
      {/* Background blobs */}
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

      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--border))_1px,transparent_0)] bg-[size:32px_32px]" />

      <div className="container relative px-4 md:px-6">
        <div className="py-3 md:py-12 max-w-3xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-1.5 md:mb-4">
            <span className="gradient-text inline-block opacity-0 animate-typeIn" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>Swap skills.</span>{" "}
            <span className="gradient-text inline-block opacity-0 animate-typeIn" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>Make friends.</span>{" "}
            <span className="text-foreground inline-block opacity-0 animate-slideFromRight" style={{ animationDelay: "0.9s", animationFillMode: "forwards" }}>Save money.</span>
          </h1>

          {/* Tagline */}
          <p className="text-[10px] md:text-base font-medium text-muted-foreground mb-3 md:mb-6 animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <span className="inline-block bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent">
              Ireland's first digital & free Barter System
            </span>
            <span className="hidden md:inline"> — no money involved</span>
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-row items-center justify-center gap-2 md:gap-3 mb-4 md:mb-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <Button size="default" className="group shadow-lg hover:shadow-xl rounded-full px-5 md:px-8 text-xs md:text-base h-9 md:h-12" asChild>
              <Link to={user ? "/new-service" : "/auth?mode=signup"}>
                <Zap className="mr-1.5 h-3.5 w-3.5 md:h-4 md:w-4" />
                {user ? "Post in 60 sec" : "Join Free"}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="default"
              className="rounded-full px-5 md:px-8 text-xs md:text-base h-9 md:h-12"
              onClick={() => {
                document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Browse
              <Coffee className="ml-1.5 h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
          </div>

          {/* Quick Links Grid */}
          <div className="grid grid-cols-3 gap-2 md:gap-3 max-w-md md:max-w-lg mx-auto animate-fade-up" style={{ animationDelay: "0.3s" }}>
            {quickLinks.map((link) => {
              const content = (
                <div className="group flex flex-col items-center gap-1 md:gap-2 p-2.5 md:p-4 rounded-xl bg-card/70 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer">
                  <span className="text-lg md:text-2xl">{link.emoji}</span>
                  <p className="font-medium text-[10px] md:text-sm text-foreground group-hover:text-primary transition-colors">
                    {link.label}
                  </p>
                  <p className="hidden md:block text-[10px] text-muted-foreground leading-tight">
                    {link.description}
                  </p>
                </div>
              );

              if (link.external) {
                return (
                  <a key={link.label} href={link.to} target="_blank" rel="noopener noreferrer">
                    {content}
                  </a>
                );
              }
              return (
                <Link key={link.label} to={link.to}>
                  {content}
                </Link>
              );
            })}
          </div>

          {/* Trustpilot widget */}
          <div className="flex justify-center mt-3 md:mt-6 animate-fade-up" style={{ animationDelay: "0.35s" }}>
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
        </div>
      </div>
    </section>
  );
}

export const HeroSection = memo(HeroSectionComponent);