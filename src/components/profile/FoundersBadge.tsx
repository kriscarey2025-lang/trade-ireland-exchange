import { forwardRef } from "react";
import { Award } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FoundersBadgeProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    icon: "h-3.5 w-3.5",
    text: "text-xs",
    padding: "px-1.5 py-0.5",
    gap: "gap-1",
  },
  md: {
    icon: "h-4 w-4",
    text: "text-sm",
    padding: "px-2 py-1",
    gap: "gap-1.5",
  },
  lg: {
    icon: "h-5 w-5",
    text: "text-base",
    padding: "px-2.5 py-1.5",
    gap: "gap-2",
  },
};

export const FoundersBadge = forwardRef<HTMLSpanElement, FoundersBadgeProps>(
  ({ size = "md", showLabel = false, className }, ref) => {
    const config = sizeConfig[size];

    const badge = (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-medium shadow-sm",
          config.padding,
          config.gap,
          config.text,
          className
        )}
      >
        <Award className={cn(config.icon, "fill-white/20")} />
        {showLabel && <span>Founding Member</span>}
      </span>
    );

    if (showLabel) {
      return badge;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">🏆 Founding Member - One of the first 50 to join Swap Skills!</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

FoundersBadge.displayName = "FoundersBadge";
