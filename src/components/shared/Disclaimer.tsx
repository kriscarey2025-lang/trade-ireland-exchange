import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DisclaimerProps {
  variant?: "compact" | "full";
  className?: string;
}

export function Disclaimer({ variant = "compact", className }: DisclaimerProps) {
  if (variant === "compact") {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        <AlertTriangle className="h-3 w-3 inline mr-1" />
        SwapSkills facilitates connections but cannot guarantee exchange outcomes. 
        <Link to="/safety" className="text-primary hover:underline ml-1">
          Stay safe
        </Link>
      </p>
    );
  }

  return (
    <div className={cn(
      "rounded-lg border border-border bg-muted/30 p-4",
      className
    )}>
      <div className="flex gap-3">
        <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
        <div className="space-y-2">
          <p className="text-sm font-medium">Your Safety is Your Responsibility</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            While we provide safety features like ID verification and reviews, SwapSkills is a 
            platform for connecting people and cannot guarantee the outcome of any exchange. 
            Always exercise caution, meet in public places when possible, and trust your instincts.
          </p>
          <Link 
            to="/safety" 
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            Read our safety guidelines →
          </Link>
        </div>
      </div>
    </div>
  );
}
