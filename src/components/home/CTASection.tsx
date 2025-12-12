import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export const CTASection = forwardRef<HTMLElement>(function CTASection(_, ref) {
  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-hero" />
      
      {/* Animated blobs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: "2s" }} />
      
      <div className="container relative text-center">
        {/* Fun emoji decoration */}
        <div className="flex justify-center gap-4 mb-6 animate-fade-up">
          <span className="text-4xl animate-bounce-soft">🍀</span>
          <span className="text-4xl animate-bounce-soft" style={{ animationDelay: "0.2s" }}>🤝</span>
          <span className="text-4xl animate-bounce-soft" style={{ animationDelay: "0.4s" }}>✨</span>
        </div>
        
        <h2 className="text-3xl md:text-5xl font-bold mb-6 animate-fade-up text-white font-display">
          Ready to Start Swapping?
        </h2>
        <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          Join Irish neighbours already trading skills. 
          It's <span className="font-bold text-white">completely free</span> for the first year!
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <Button 
            size="xl" 
            className="bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl font-semibold rounded-2xl"
            asChild
          >
            <Link to="/auth?mode=signup">
              <Sparkles className="mr-2 h-5 w-5" />
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="xl"
            className="border-2 border-white/40 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl"
            asChild
          >
            <Link to="/browse">Browse Services</Link>
          </Button>
        </div>
      </div>
    </section>
  );
});