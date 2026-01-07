import { forwardRef } from "react";
import { BadgeCheck, Clock, ShieldX } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

interface VerifiedBadgeProps {
  status: VerificationStatus;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const statusConfig = {
  verified: {
    icon: BadgeCheck,
    label: "ID Verified",
    tooltip: "This user has verified their identity",
    iconClass: "text-primary",
    bgClass: "bg-primary/10",
  },
  pending: {
    icon: Clock,
    label: "Pending",
    tooltip: "Verification is being reviewed",
    iconClass: "text-warning",
    bgClass: "bg-warning/10",
  },
  rejected: {
    icon: ShieldX,
    label: "Rejected",
    tooltip: "Verification was not approved",
    iconClass: "text-destructive",
    bgClass: "bg-destructive/10",
  },
  unverified: {
    icon: null,
    label: "",
    tooltip: "",
    iconClass: "",
    bgClass: "",
  },
};

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

export const VerifiedBadge = forwardRef<HTMLDivElement, VerifiedBadgeProps>(
  ({ status, size = "md", showLabel = false, className }, ref) => {
    const config = statusConfig[status];
    const sizes = sizeConfig[size];

    if (status === "unverified" || !config.icon) {
      return null;
    }

    const Icon = config.icon;

    const badge = (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full font-medium",
          sizes.gap,
          showLabel ? sizes.padding : "",
          showLabel ? config.bgClass : "",
          className
        )}
      >
        <Icon className={cn(sizes.icon, config.iconClass)} />
        {showLabel && (
          <span className={cn(sizes.text, config.iconClass)}>{config.label}</span>
        )}
      </div>
    );

    if (!showLabel) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{badge}</TooltipTrigger>
            <TooltipContent>
              <p>{config.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return badge;
  }
);

VerifiedBadge.displayName = "VerifiedBadge";
