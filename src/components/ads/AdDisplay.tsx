import { useAdTracking } from "@/hooks/useAdTracking";
import { Megaphone, ExternalLink } from "lucide-react";

interface Ad {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
}

interface AdDisplayProps {
  ad: Ad | null;
  variant?: "side" | "inline";
  className?: string;
  showPlaceholder?: boolean;
}

export function AdDisplay({ ad, variant = "side", className = "", showPlaceholder = true }: AdDisplayProps) {
  const { setAdRef, trackClick } = useAdTracking(ad?.id || null);

  const handleClick = () => {
    if (ad?.link_url) {
      trackClick();
      window.open(ad.link_url, "_blank", "noopener,noreferrer");
    }
  };

  // Show placeholder if no ad
  if (!ad) {
    if (!showPlaceholder) return null;
    
    return (
      <div 
        className={`
          bg-muted/30 border border-border/30 rounded-md
          flex flex-col items-center justify-center text-center p-3
          transition-all hover:border-border/50
          ${variant === "side" ? "min-h-[120px]" : "py-4"}
          ${className}
        `}
      >
        <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center mb-2">
          <Megaphone className="w-4 h-4 text-primary/40" />
        </div>
        <p className="text-xs text-muted-foreground/70">
          Ad Space
        </p>
      </div>
    );
  }

  // Inline variant: horizontal layout (image left, text right)
  if (variant === "inline") {
    return (
      <div
        ref={setAdRef}
        onClick={handleClick}
        className={`
          bg-card/50 border border-border/40 rounded-lg overflow-hidden
          cursor-pointer transition-all hover:border-border hover:bg-card
          flex flex-row items-stretch w-full
          ${className}
        `}
      >
        {ad.image_url ? (
          <div className="w-32 sm:w-40 flex-shrink-0 bg-muted/20 flex items-center justify-center">
            <img
              src={ad.image_url}
              alt={ad.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-32 sm:w-40 flex-shrink-0 bg-muted/50 flex items-center justify-center">
            <Megaphone className="w-8 h-8 text-muted-foreground/30" />
          </div>
        )}
        
        <div className="flex-1 p-4 flex flex-col justify-center">
          <h4 className="font-medium text-sm text-foreground line-clamp-2 leading-snug">
            {ad.title}
          </h4>
          {ad.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {ad.description}
            </p>
          )}
          {ad.link_url && (
            <div className="flex items-center gap-1 mt-2 text-xs text-primary">
              <span>Learn more</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          )}
          <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wide mt-2">
            Ad
          </span>
        </div>
      </div>
    );
  }

  // Side variant: vertical layout (image top, text below)
  return (
    <div
      ref={setAdRef}
      onClick={handleClick}
      className={`
        bg-card/50 border border-border/40 rounded-md overflow-hidden
        cursor-pointer transition-all hover:border-border hover:bg-card
        w-full
        ${className}
      `}
    >
      {ad.image_url ? (
        <div className="relative overflow-hidden flex items-center justify-center h-20">
          <img
            src={ad.image_url}
            alt={ad.title}
            className="max-w-full max-h-full object-contain bg-muted/20"
          />
        </div>
      ) : (
        <div className="h-14 bg-muted/50 flex items-center justify-center">
          <Megaphone className="w-5 h-5 text-muted-foreground/30" />
        </div>
      )}
      
      <div className="p-2">
        <h4 className="font-medium text-xs text-foreground line-clamp-2 leading-tight">
          {ad.title}
        </h4>
        {ad.link_url && (
          <div className="flex items-center gap-0.5 mt-1 text-[10px] text-primary/70">
            <span>Learn more</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </div>
        )}
      </div>
      
      <div className="px-2 pb-1.5">
        <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wide">
          Ad
        </span>
      </div>
    </div>
  );
}
