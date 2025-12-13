import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { OnboardingQuestionnaire } from "@/components/onboarding/OnboardingQuestionnaire";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [checkingPrefs, setCheckingPrefs] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user has already completed onboarding
    const checkOnboarding = async () => {
      const { data } = await supabase
        .from("user_preferences")
        .select("onboarding_completed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.onboarding_completed) {
        navigate("/");
      } else {
        setCheckingPrefs(false);
      }
    };

    checkOnboarding();
  }, [user, authLoading, navigate]);

  if (authLoading || checkingPrefs) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <OnboardingQuestionnaire />;
}
