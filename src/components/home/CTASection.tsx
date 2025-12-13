import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart } from "lucide-react";

export const CTASection = forwardRef<HTMLElement>(function CTASection(_, ref) {
  return (
    <section ref={ref} className="py-20 md:py-28 relative overflow-hidden">
      {/* Warm gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-accent/80" />
      
      {/* Soft blobs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
      
      <div className="container relative text-center">
        {/* Friendly emoji decoration */}
        <div className="flex justify-center gap-4 mb-6 animate-fade-up">
          <span className="text-4xl animate-bounce-soft">🍀</span>
          <span className="text-4xl animate-bounce-soft" style={{ animationDelay: "0.2s" }}>☕</span>
          <span className="text-4xl animate-bounce-soft" style={{ animationDelay: "0.4s" }}>🤝</span>
        </div>
        
        <h2 className="text-3xl md:text-5xl font-bold mb-6 animate-fade-up text-white font-display">
          Fancy giving it a go?
        </h2>
        <p className="text-lg text-white/85 max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          Join the neighbours already swapping skills across Ireland. 
          It's <span className="font-bold text-white">completely free</span> — no catch, we promise!
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/95 shadow-xl hover:shadow-2xl font-semibold rounded-full px-8"
            asChild
          >
            <Link to="/auth?mode=signup">
              <Heart className="mr-2 h-5 w-5" />
              Join the community
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-2 border-white/40 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full px-8"
            asChild
          >
            <Link to="/browse">Have a look around first</Link>
          </Button>
        </div>
        
        <p className="text-sm text-white/60 mt-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          Built with love in Killeshin, Carlow 🍀
        </p>
      </div>
    </section>
  );
});
