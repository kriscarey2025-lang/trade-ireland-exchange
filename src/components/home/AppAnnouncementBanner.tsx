import { Smartphone } from "lucide-react";

export function AppAnnouncementBanner() {
  return (
    <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-y border-border/50">
      <div className="container py-4">
        <div className="flex items-center justify-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <span className="text-sm md:text-base font-medium">
              <span className="text-primary">Free Android & iOS App</span>
              <span className="text-muted-foreground"> — Coming Soon! 🚀</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
