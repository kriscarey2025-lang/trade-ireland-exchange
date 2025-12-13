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
          bg-gradient-to-br from-muted/50 to-muted border border-border/50 rounded-lg
          flex flex-col items-center justify-center text-center p-4
          transition-all hover:border-primary/30 hover:shadow-sm
          ${variant === "side" ? "min-h-[300px]" : "py-6"}
          ${className}
        `}
      >
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Megaphone className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">
          Your Local Ad Space
        </p>
        <p className="text-xs text-muted-foreground max-w-[180px]">
          Guaranteed to be your local businesses only
        </p>
      </div>
    );
  }

  return (
    <div
      ref={setAdRef}
      onClick={handleClick}
      className={`
        bg-card border border-border rounded-lg overflow-hidden
        cursor-pointer transition-all hover:shadow-md hover:border-primary/30
        ${variant === "side" ? "min-h-[250px]" : ""}
        ${className}
      `}
    >
      {ad.image_url ? (
        <div className={`relative ${variant === "side" ? "h-32" : "h-24"} overflow-hidden`}>
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className={`${variant === "side" ? "h-24" : "h-16"} bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center`}>
          <Megaphone className="w-8 h-8 text-primary/50" />
        </div>
      )}
      
      <div className="p-3">
        <h4 className="font-medium text-sm text-foreground line-clamp-2 mb-1">
          {ad.title}
        </h4>
        {ad.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {ad.description}
          </p>
        )}
        {ad.link_url && (
          <div className="flex items-center gap-1 mt-2 text-xs text-primary">
            <span>Learn more</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        )}
      </div>
      
      <div className="px-3 pb-2">
        <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">
          Sponsored
        </span>
      </div>
    </div>
  );
}
