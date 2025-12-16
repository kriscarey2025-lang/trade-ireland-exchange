import { Smartphone, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export function AppAnnouncementBanner() {
  const [showBeta, setShowBeta] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowBeta((prev) => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full px-4 py-3">
      <div className="container">
        <div className="w-full py-3 px-6 rounded-full border-2 border-primary/40 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 text-center flex items-center justify-center gap-3 hover:border-primary/60 transition-colors overflow-hidden">
          <div className="relative h-6 flex items-center justify-center">
            {/* App announcement */}
            <div
              className={`flex items-center gap-3 transition-all duration-700 ease-in-out ${
                showBeta ? "opacity-0 -translate-y-8" : "opacity-100 translate-y-0"
              }`}
            >
              <Smartphone className="h-4 w-4 text-primary hidden sm:block" />
              <span className="text-sm font-semibold tracking-wide text-foreground/80">
                Free <span className="text-primary">Android</span> & <span className="text-primary">iOS</span> App Coming Soon
              </span>
              <span className="text-lg">🚀</span>
            </div>

            {/* Beta announcement */}
            <div
              className={`absolute inset-0 flex items-center justify-center gap-3 transition-all duration-700 ease-in-out ${
                showBeta ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <Sparkles className="h-4 w-4 text-primary hidden sm:block animate-pulse" />
              <span className="text-sm font-semibold tracking-wide text-foreground/80">
                <span className="text-primary">Beta Testing</span> in County Carlow — come be part of it!
              </span>
              <span className="text-lg">☘️</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
