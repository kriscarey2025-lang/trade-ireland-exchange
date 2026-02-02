import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type ConsentState = "accepted" | "rejected";

const STORAGE_KEY = "ss_cookie_consent_v1";

function readConsent(): ConsentState | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    return null;
  }
}

function writeConsent(value: ConsentState) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore
  }
}

function loadHubSpot() {
  if (typeof window === "undefined") return;
  if (document.getElementById("hs-script-loader")) return;

  const s = document.createElement("script");
  s.id = "hs-script-loader";
  s.async = true;
  s.src = "https://js.hs-scripts.com/20561907.js";
  document.head.appendChild(s);
}

export function CookieConsent() {
  // Initialize synchronously to avoid first-render flicker (and any potential CLS)
  const [consent, setConsent] = useState<ConsentState | null>(() => {
    if (typeof window === "undefined") return null;
    return readConsent();
  });
  const shouldShow = useMemo(() => consent === null, [consent]);

  // Load tracking only after explicit acceptance (prevents CLS/LCP regressions on mobile)
  useEffect(() => {
    if (consent !== "accepted") return;
    const w = window as any;
    const run = () => loadHubSpot();

    if (typeof w.requestIdleCallback === "function") {
      w.requestIdleCallback(run, { timeout: 2500 });
      return;
    }

    const t = window.setTimeout(run, 1200);
    return () => window.clearTimeout(t);
  }, [consent]);

  if (!shouldShow) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] md:bottom-4 md:left-4 md:right-auto md:w-[420px]"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="mx-3 mb-3 rounded-2xl border border-border bg-background/95 backdrop-blur-xl shadow-lg safe-area-bottom">
        <div className="p-4">
          <p className="text-sm font-semibold text-foreground">Cookies & performance</p>
          <p className="mt-1 text-sm text-muted-foreground">
            We use optional analytics to improve Swap Skills. You can accept or reject—either way the app works.
          </p>
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                writeConsent("rejected");
                setConsent("rejected");
              }}
            >
              Reject
            </Button>
            <Button
              size="sm"
              onClick={() => {
                writeConsent("accepted");
                setConsent("accepted");
              }}
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
