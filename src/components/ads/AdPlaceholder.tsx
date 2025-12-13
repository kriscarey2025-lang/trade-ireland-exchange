import { Megaphone } from "lucide-react";

interface AdPlaceholderProps {
  variant?: "side" | "inline";
  className?: string;
}

export function AdPlaceholder({ variant = "side", className = "" }: AdPlaceholderProps) {
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
