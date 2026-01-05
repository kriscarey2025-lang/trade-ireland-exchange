import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Variant = "A" | "B";

interface ABTestResult {
  variant: Variant;
  trackConversion: (action: string) => void;
}

/**
 * Simple A/B testing hook that:
 * - Randomly assigns users to variant A or B (50/50)
 * - Persists assignment in localStorage
 * - Tracks conversions to user_engagement table
 */
export function useABTest(testName: string): ABTestResult {
  const [variant, setVariant] = useState<Variant>("A");

  useEffect(() => {
    const storageKey = `ab_test_${testName}`;
    const stored = localStorage.getItem(storageKey);

    if (stored === "A" || stored === "B") {
      setVariant(stored);
    } else {
      // Randomly assign 50/50
      const newVariant: Variant = Math.random() < 0.5 ? "A" : "B";
      localStorage.setItem(storageKey, newVariant);
      setVariant(newVariant);

      // Track test assignment
      trackEvent(testName, `assigned_${newVariant}`);
    }
  }, [testName]);

  const trackConversion = (action: string) => {
    trackEvent(testName, `${variant}_${action}`);
  };

  return { variant, trackConversion };
}

async function trackEvent(testName: string, action: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from("user_engagement").insert({
      user_id: user?.id || "anonymous",
      event_type: "ab_test",
      page_path: window.location.pathname,
      metadata: {
        test_name: testName,
        action,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    // Silent fail - don't break UX for analytics
    console.debug("AB test tracking failed:", error);
  }
}
