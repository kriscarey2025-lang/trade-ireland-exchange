import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-hero text-primary-foreground">
      <div className="container text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-up">
          Ready to Start Trading Skills?
        </h2>
        <p className="text-lg opacity-90 max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          Join hundreds of Irish neighbours already swapping skills. 
          It's completely free to sign up and start browsing.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <Button 
            size="xl" 
            className="bg-background text-foreground hover:bg-background/90"
            asChild
          >
            <Link to="/auth?mode=signup">
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="xl"
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            asChild
          >
            <Link to="/browse">Browse Services</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
