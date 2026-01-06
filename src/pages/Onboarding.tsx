import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, CheckCircle2 } from "lucide-react";
import { OnboardingQuestionnaire } from "@/components/onboarding/OnboardingQuestionnaire";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [checkingPrefs, setCheckingPrefs] = useState(true);
  const [isEmailConfirming, setIsEmailConfirming] = useState(false);
  const [confirmationSuccess, setConfirmationSuccess] = useState(false);

  // Handle email confirmation callback (when user clicks verification link)
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      // Check if this is a callback from email confirmation
      // Supabase uses hash fragments for the token
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if (accessToken && type === 'signup') {
        setIsEmailConfirming(true);
        
        // The auth state change should handle this automatically,
        // but we show a nice confirmation message
        setConfirmationSuccess(true);
        toast.success("Email verified successfully! Welcome to SwapSkills 🎉");
        
        // Clear the hash from URL for cleaner UX
        window.history.replaceState(null, '', location.pathname);
        
        // Give a moment for the auth state to update
        setTimeout(() => {
          setIsEmailConfirming(false);
        }, 1500);
      }
    };

    handleEmailConfirmation();
  }, [location]);

  useEffect(() => {
    // Don't redirect while confirming email or auth is loading
    if (authLoading || isEmailConfirming) return;
    
    if (!user) {
      // Give a bit more time for auth to settle after email confirmation
      const timeout = setTimeout(() => {
        if (!user) {
          navigate("/auth");
        }
      }, 500);
      return () => clearTimeout(timeout);
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
  }, [user, authLoading, isEmailConfirming, navigate]);

  // Show email confirmation success screen
  if (isEmailConfirming || (confirmationSuccess && authLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold">Email Verified!</h2>
          <p className="text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  if (authLoading || checkingPrefs) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <OnboardingQuestionnaire />;
}
