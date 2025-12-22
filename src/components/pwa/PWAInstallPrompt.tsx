import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if user has dismissed before
    const dismissed = localStorage.getItem("pwa-prompt-dismissed");
    const visitCount = parseInt(localStorage.getItem("pwa-visit-count") || "0", 10);
    
    // Increment visit count
    localStorage.setItem("pwa-visit-count", String(visitCount + 1));

    // Only show after 2+ visits and if not dismissed in last 7 days
    if (visitCount < 1) return;
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return;
    }

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // For iOS, show manual install instructions
    if (isIOSDevice) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // For Android/Desktop, listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setShowPrompt(false);
      localStorage.removeItem("pwa-visit-count");
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", new Date().toISOString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:hidden animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 relative overflow-hidden">
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm">
              Install SwapSkills
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {isIOS
                ? "Tap the share button, then 'Add to Home Screen'"
                : "Get quick access from your home screen"}
            </p>
          </div>
        </div>

        {!isIOS && (
          <Button
            onClick={handleInstall}
            className="w-full mt-3 gap-2"
            size="sm"
          >
            <Download className="h-4 w-4" />
            Install App
          </Button>
        )}

        {isIOS && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>1. Tap</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L12 14M12 2L8 6M12 2L16 6M4 16V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V16"/>
              </svg>
              <span>Share</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span>2. Scroll down & tap "Add to Home Screen"</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
