import { Smartphone } from "lucide-react";

export function AppAnnouncementBanner() {
  return (
    <div className="w-full px-4 py-3">
      <div className="container">
        <div className="w-full py-3 px-6 rounded-full border-2 border-primary/40 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 text-center flex items-center justify-center gap-3 hover:border-primary/60 transition-colors">
          <Smartphone className="h-4 w-4 text-primary hidden sm:block" />
          <span className="text-sm font-semibold tracking-wide text-foreground/80">
            Free <span className="text-primary">Android</span> & <span className="text-primary">iOS</span> App Coming Soon
          </span>
          <span className="text-lg">🚀</span>
        </div>
      </div>
    </div>
  );
}
