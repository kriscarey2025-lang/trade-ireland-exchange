import { Smartphone, Sparkles, Zap } from "lucide-react";
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
        <div className="relative w-full py-3 px-6 rounded-full border-2 border-primary/50 bg-gradient-to-r from-primary/15 via-primary/5 to-primary/15 text-center flex items-center justify-center gap-3 hover:border-primary transition-all duration-300 overflow-hidden group hover:shadow-lg hover:shadow-primary/20">
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {/* Floating particles */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:block">
            <Zap className="h-4 w-4 text-primary/60 animate-pulse" />
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block">
            <Sparkles className="h-4 w-4 text-primary/60 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>

          <div className="relative h-6 flex items-center justify-center">
            {/* App announcement */}
            <div
              className={`flex items-center gap-3 transition-all duration-700 ease-in-out ${
                showBeta ? "opacity-0 -translate-y-8 scale-95" : "opacity-100 translate-y-0 scale-100"
              }`}
            >
              <Smartphone className="h-4 w-4 text-primary hidden sm:block animate-bounce" style={{ animationDuration: '2s' }} />
              <span className="text-sm font-bold tracking-wide text-foreground">
                Free <span className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">Android</span> & <span className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">iOS</span> App Coming Soon
              </span>
              <span className="text-lg animate-bounce" style={{ animationDuration: '1.5s' }}>🚀</span>
            </div>

            {/* Beta announcement */}
            <div
              className={`absolute inset-0 flex items-center justify-center gap-3 transition-all duration-700 ease-in-out ${
                showBeta ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
              }`}
            >
              <Sparkles className="h-4 w-4 text-primary hidden sm:block animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-sm font-bold tracking-wide text-foreground">
                🎉 <span className="bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">New Platform!</span> Beta Testing in <span className="text-primary font-extrabold">County Carlow</span> — join us!
              </span>
              <span className="text-lg animate-pulse">☘️</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
