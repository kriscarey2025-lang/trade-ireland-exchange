import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Simple hash function for IP anonymization
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

export function useAdTracking(adId: string | null) {
  const { user } = useAuth();
  const hasTrackedImpression = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);

  const trackImpression = useCallback(async () => {
    if (!adId || hasTrackedImpression.current) return;
    
    hasTrackedImpression.current = true;
    
    try {
      // Get a simple identifier for deduplication (we'll hash the user agent)
      const ipHash = await hashString(navigator.userAgent + new Date().toDateString());
      
      await supabase.from("ad_impressions").insert({
        ad_id: adId,
        viewer_id: user?.id || null,
        page_url: window.location.pathname,
        user_agent: navigator.userAgent,
        ip_hash: ipHash,
      });
    } catch (error) {
      console.error("Failed to track ad impression:", error);
    }
  }, [adId, user?.id]);

  const trackClick = useCallback(async () => {
    if (!adId) return;
    
    try {
      const ipHash = await hashString(navigator.userAgent + new Date().toDateString());
      
      await supabase.from("ad_clicks").insert({
        ad_id: adId,
        viewer_id: user?.id || null,
        page_url: window.location.pathname,
        user_agent: navigator.userAgent,
        ip_hash: ipHash,
      });
    } catch (error) {
      console.error("Failed to track ad click:", error);
    }
  }, [adId, user?.id]);

  // Set up intersection observer for viewability tracking
  const setAdRef = useCallback((element: HTMLDivElement | null) => {
    if (elementRef.current) {
      observerRef.current?.unobserve(elementRef.current);
    }

    elementRef.current = element;

    if (element && adId) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Track impression when ad is 50% visible
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
              trackImpression();
            }
          });
        },
        { threshold: 0.5 }
      );

      observerRef.current.observe(element);
    }
  }, [adId, trackImpression]);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return { setAdRef, trackClick };
}
