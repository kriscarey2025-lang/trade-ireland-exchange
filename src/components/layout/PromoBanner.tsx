import { Link } from "react-router-dom";
import { X, Megaphone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground relative">
      <div className="container mx-auto px-4 py-2.5">
        <div className="flex items-center justify-center gap-3 text-sm">
          <Megaphone className="h-4 w-4 flex-shrink-0 animate-pulse" />
          <p className="text-center">
            <span className="font-semibold">Carlow Businesses:</span>{" "}
            <span className="hidden sm:inline">Get a </span>
            <span className="font-bold underline decoration-2 underline-offset-2">FREE</span> advertising spot!
            <Link 
              to="/advertise" 
              className="ml-2 inline-flex items-center font-semibold hover:underline underline-offset-2"
            >
              Apply now →
            </Link>
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 absolute right-2 top-1/2 -translate-y-1/2 hover:bg-primary-foreground/20 text-primary-foreground"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss banner</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
