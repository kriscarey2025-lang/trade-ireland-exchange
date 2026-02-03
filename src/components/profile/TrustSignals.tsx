import { Badge } from "@/components/ui/badge";
import { Handshake, Star, Linkedin, Facebook, Instagram, ShieldCheck, ShieldX, Clock } from "lucide-react";
import { VerifiedBadge } from "./VerifiedBadge";
import { FoundersBadge } from "./FoundersBadge";
import { cn } from "@/lib/utils";

interface TrustSignalsProps {
  completedSwaps?: number;
  rating?: number | null;
  reviewCount?: number;
  verificationStatus?: "verified" | "pending" | "unverified" | "rejected";
  isFounder?: boolean;
  linkedinUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  variant?: "compact" | "full" | "card";
  className?: string;
}

export function TrustSignals({
  completedSwaps = 0,
  rating,
  reviewCount = 0,
  verificationStatus = "unverified",
  isFounder = false,
  linkedinUrl,
  facebookUrl,
  instagramUrl,
  variant = "compact",
  className,
}: TrustSignalsProps) {
  const hasSocialLinks = linkedinUrl || facebookUrl || instagramUrl;

  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
        {/* Swap Count Badge */}
        {completedSwaps > 0 && (
          <Badge 
            variant="secondary" 
            className="rounded-full bg-accent/10 text-accent border-accent/30 gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5"
          >
            <Handshake className="h-3 w-3" />
            {completedSwaps} {completedSwaps === 1 ? 'swap' : 'swaps'}
          </Badge>
        )}

        {/* Rating Badge */}
        {rating !== null && rating !== undefined && (
          <Badge 
            variant="secondary" 
            className="rounded-full bg-warning/10 text-warning border-warning/30 gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5"
          >
            <Star className="h-3 w-3 fill-current" />
            {rating.toFixed(1)}
          </Badge>
        )}

        {/* Verified Badge */}
        <VerifiedBadge status={verificationStatus} size="sm" />
        
        {/* Founder Badge */}
        {isFounder && <FoundersBadge size="sm" />}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("space-y-3", className)}>
        {/* Trust Badges Row */}
        <div className="flex flex-wrap gap-2">
          {/* Verification Status */}
          {verificationStatus === "verified" && (
            <Badge className="rounded-full bg-green-500/10 text-green-600 border-green-500/30 gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Member
            </Badge>
          )}
          {verificationStatus === "pending" && (
            <Badge variant="secondary" className="rounded-full gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Verification Pending
            </Badge>
          )}
          
          {/* Founder */}
          {isFounder && (
            <Badge className="rounded-full bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1.5">
              <Star className="h-3.5 w-3.5 fill-current" />
              Founding Member
            </Badge>
          )}
          
          {/* Swap Count */}
          {completedSwaps > 0 && (
            <Badge className="rounded-full bg-accent/10 text-accent border-accent/30 gap-1.5">
              <Handshake className="h-3.5 w-3.5" />
              {completedSwaps} {completedSwaps === 1 ? 'Swap' : 'Swaps'} Completed
            </Badge>
          )}
        </div>

        {/* Rating */}
        {(rating !== null && rating !== undefined) && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={cn(
                    "h-4 w-4",
                    star <= Math.round(rating) 
                      ? "fill-warning text-warning" 
                      : "text-muted-foreground/30"
                  )} 
                />
              ))}
            </div>
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}

        {/* Social Links - Labeled Buttons */}
        {hasSocialLinks && (
          <div className="flex flex-wrap gap-2 pt-1">
            {linkedinUrl && (
              <a 
                href={linkedinUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 transition-colors text-sm font-medium"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
            )}
            {facebookUrl && (
              <a 
                href={facebookUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors text-sm font-medium"
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </a>
            )}
            {instagramUrl && (
              <a 
                href={instagramUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E4405F]/10 text-[#E4405F] hover:bg-[#E4405F]/20 transition-colors text-sm font-medium"
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full variant (for profile pages)
  return (
    <div className={cn("space-y-4", className)}>
      {/* Trust Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-xl bg-secondary/50">
          <Handshake className="h-5 w-5 mx-auto text-accent mb-1" />
          <p className="text-xl font-bold">{completedSwaps}</p>
          <p className="text-xs text-muted-foreground">Swaps</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-secondary/50">
          <Star className="h-5 w-5 mx-auto text-warning mb-1" />
          <p className="text-xl font-bold">{rating?.toFixed(1) || '-'}</p>
          <p className="text-xs text-muted-foreground">{reviewCount} reviews</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-secondary/50">
          {verificationStatus === "verified" ? (
            <>
              <ShieldCheck className="h-5 w-5 mx-auto text-green-500 mb-1" />
              <p className="text-sm font-bold text-green-600">Verified</p>
            </>
          ) : verificationStatus === "pending" ? (
            <>
              <Clock className="h-5 w-5 mx-auto text-amber-500 mb-1" />
              <p className="text-sm font-bold text-amber-600">Pending</p>
            </>
          ) : (
            <>
              <ShieldX className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-sm font-bold text-muted-foreground">Unverified</p>
            </>
          )}
          <p className="text-xs text-muted-foreground">Status</p>
        </div>
      </div>

      {/* Social Links */}
      {hasSocialLinks && (
        <div className="flex flex-wrap gap-2">
          {linkedinUrl && (
            <a 
              href={linkedinUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 transition-colors text-sm font-medium"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </a>
          )}
          {facebookUrl && (
            <a 
              href={facebookUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors text-sm font-medium"
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </a>
          )}
          {instagramUrl && (
            <a 
              href={instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#E4405F]/10 text-[#E4405F] hover:bg-[#E4405F]/20 transition-colors text-sm font-medium"
            >
              <Instagram className="h-4 w-4" />
              Instagram
            </a>
          )}
        </div>
      )}
    </div>
  );
}
