import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, Loader2, Mail, CheckCircle2, Users, Shield, Clock, Heart, Sparkles, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { fireConfetti } from "@/hooks/useConfetti";
import { submitToHubSpot, parseFullName } from "@/hooks/useHubSpot";

const emailSchema = z.string().trim().email({ message: "Invalid email address" }).max(255);
const passwordSchema = z.string().min(8, { message: "Password must be at least 8 characters" }).max(128);
const nameSchema = z.string().trim().min(1, { message: "Name is required" }).max(100);
const locationSchema = z.string().trim().min(1, { message: "Location is required" }).max(100);

// Password strength calculator
const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 15;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 20;
  if (/\d/.test(password)) score += 20;
  if (/[^a-zA-Z0-9]/.test(password)) score += 20;
  
  if (score < 40) return { score, label: "Weak", color: "bg-destructive" };
  if (score < 70) return { score, label: "Fair", color: "bg-yellow-500" };
  if (score < 90) return { score, label: "Good", color: "bg-blue-500" };
  return { score, label: "Strong", color: "bg-green-500" };
};

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const defaultTab = searchParams.get("mode") === "signup" ? "signup" : "login";
  const redirectTo = searchParams.get("redirect");
  
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/onboarding`,
      },
    });
    
    if (error) {
      toast.error(error.message);
      setIsGoogleLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationEmail) return;
    setIsResending(true);
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: verificationEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    });
    
    if (error) {
      toast.error("Failed to resend verification email. Please try again.");
    } else {
      toast.success("Verification email sent! Check your inbox.");
    }
    setIsResending(false);
  };

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupLocation, setSignupLocation] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(false);
  const [agreedToConduct, setAgreedToConduct] = useState(false);

  // Password strength
  const passwordStrength = useMemo(() => getPasswordStrength(signupPassword), [signupPassword]);

  // Redirect if already logged in - check if onboarding is complete and advertiser status
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user || authLoading) return;
      
      // If there's a specific redirect with action, go there with action param preserved
      if (redirectTo) {
        const action = searchParams.get("action");
        const redirectUrl = action ? `${redirectTo}?action=${action}` : redirectTo;
        navigate(redirectUrl);
        return;
      }
      
      // Check if user is an advertiser
      const { data: advertiser } = await supabase
        .from("advertisers")
        .select("id, is_active")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (advertiser?.is_active) {
        navigate('/advertiser');
        return;
      }
      
      // Check onboarding status
      const { data } = await supabase
        .from("user_preferences")
        .select("onboarding_completed")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data?.onboarding_completed) {
        navigate('/');
      } else {
        navigate('/onboarding');
      }
    };
    
    if (user && !authLoading) {
      checkUserStatus();
    }
  }, [user, authLoading, navigate, redirectTo, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const emailResult = emailSchema.safeParse(loginEmail);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      return;
    }
    
    const passwordResult = passwordSchema.safeParse(loginPassword);
    if (!passwordResult.success) {
      toast.error(passwordResult.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error("Invalid email or password");
      } else if (error.message.includes('Email not confirmed')) {
        toast.error("Please confirm your email address");
      } else {
        toast.error(error.message);
      }
      setIsLoading(false);
      return;
    }

    toast.success("Welcome back!");
    // Handle redirect with action preserved
    if (redirectTo) {
      const action = searchParams.get("action");
      const redirectUrl = action ? `${redirectTo}?action=${action}` : redirectTo;
      navigate(redirectUrl);
    } else {
      navigate('/');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms || !agreedToDisclaimer || !agreedToConduct) {
      toast.error("Please agree to all required conditions before signing up");
      return;
    }

    // Validate inputs
    const nameResult = nameSchema.safeParse(signupName);
    if (!nameResult.success) {
      toast.error(nameResult.error.errors[0].message);
      return;
    }

    const emailResult = emailSchema.safeParse(signupEmail);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      return;
    }

    const passwordResult = passwordSchema.safeParse(signupPassword);
    if (!passwordResult.success) {
      toast.error(passwordResult.error.errors[0].message);
      return;
    }

    const locationResult = locationSchema.safeParse(signupLocation);
    if (!locationResult.success) {
      toast.error(locationResult.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(signupEmail, signupPassword, signupName, signupLocation);
    
    if (error) {
      if (error.message.includes('User already registered')) {
        toast.error("An account with this email already exists. Please sign in instead.");
      } else {
        toast.error(error.message);
      }
      setIsLoading(false);
      return;
    }

    // Submit to HubSpot
    const { firstname, lastname } = parseFullName(signupName);
    submitToHubSpot({
      email: signupEmail,
      firstname,
      lastname,
      city: signupLocation,
      form_source: 'Signup Form',
    });
    
    // Celebrate the signup!
    setTimeout(() => fireConfetti(), 300);
    
    // Navigate directly to onboarding - no email verification needed
    toast.success("Welcome to SwapSkills! Let's set up your profile.");
    navigate('/onboarding');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary/50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Email verification confirmation screen
  if (showVerificationScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary/50">
        <Header />
        <main className="container py-8 md:py-16">
          <div className="max-w-lg mx-auto animate-fade-up">
            <Card className="shadow-lg border-border/50 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />
              <CardHeader className="text-center pb-4 pt-8">
                <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 animate-bounce-soft">
                  <Mail className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl md:text-3xl">Check your email</CardTitle>
                <CardDescription className="text-base mt-2">
                  We've sent a verification link to
                </CardDescription>
                <p className="font-semibold text-foreground text-lg mt-1 break-all">{verificationEmail}</p>
              </CardHeader>
              <CardContent className="space-y-6 pb-8">
                <div className="bg-muted/50 rounded-xl p-5 space-y-4">
                  {[
                    { step: 1, title: "Open your email", desc: "Look for an email from SwapSkills" },
                    { step: 2, title: "Click the verification link", desc: "This confirms your email address" },
                    { step: 3, title: "Start swapping skills!", desc: "Complete your profile and browse services" },
                  ].map((item, index) => (
                    <div 
                      key={item.step} 
                      className="flex items-start gap-4 animate-fade-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">{item.step}</span>
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Can't find the email?</strong> Check your spam or junk folder. The email might take a minute to arrive.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base"
                    onClick={handleResendVerification}
                    disabled={isResending}
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-5 w-5" />
                        Resend verification email
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setShowVerificationScreen(false);
                      setVerificationEmail("");
                    }}
                  >
                    Use a different email
                  </Button>
                </div>

                <Separator />

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3">Already verified?</p>
                  <Button
                    variant="hero"
                    className="w-full h-12 text-base"
                    onClick={() => navigate('/auth?mode=login')}
                  >
                    Sign in to your account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trust indicators */}
            <div className="mt-8 grid grid-cols-3 gap-6 text-center">
              {[
                { icon: Users, label: "Local Community" },
                { icon: Shield, label: "Verified Users" },
                { icon: Clock, label: "Quick Setup" },
              ].map((item, index) => (
                <div 
                  key={item.label}
                  className="space-y-2 animate-fade-up"
                  style={{ animationDelay: `${(index + 3) * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary/50">
      <Header />
      <main className="container py-8 md:py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center max-w-6xl mx-auto">
          
          {/* Left side - Hero content (hidden on mobile) */}
          <div className="hidden lg:block space-y-8 animate-fade-up">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Heart className="h-4 w-4" />
                <span>Ireland's Skill-Swapping Community</span>
              </div>
              <h1 className="text-4xl xl:text-5xl font-display font-bold leading-tight">
                Trade skills,<br />
                <span className="gradient-text">not money</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Connect with verified neighbours across Ireland to exchange services—from gardening to tutoring, tiling to childcare.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="space-y-4">
              {[
                { icon: Users, title: "Local Community", desc: "Connect with people in your area" },
                { icon: Shield, title: "Verified Members", desc: "Trust badges for extra peace of mind" },
                { icon: MapPin, title: "Ireland-wide", desc: "From Dublin to Cork to Galway" },
              ].map((feature, index) => (
                <div 
                  key={feature.title}
                  className="flex items-start gap-4 p-4 rounded-xl bg-card/50 hover:bg-card transition-colors animate-fade-up"
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-background flex items-center justify-center text-xs font-bold text-primary"
                  >
                    {['S', 'M', 'K', 'J'][i - 1]}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Join your neighbours</span> in Ireland's growing skill-swap community
              </p>
            </div>
          </div>

          {/* Right side - Auth form */}
          <div className="w-full max-w-md mx-auto lg:mx-0 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <Card className="shadow-lg border-border/50 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
              <CardHeader className="text-center pb-2 pt-6">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl mb-4 shadow-md">
                  🤝
                </div>
                <CardTitle className="text-2xl">Welcome to SwapSkills</CardTitle>
                <CardDescription className="text-base">
                  Trade skills with your Irish neighbours
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <Tabs defaultValue={defaultTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
                    <TabsTrigger value="login" className="text-base">Sign In</TabsTrigger>
                    <TabsTrigger value="signup" className="text-base">Sign Up</TabsTrigger>
                  </TabsList>

                  {/* Login Tab */}
                  <TabsContent value="login" className="space-y-4 animate-fade-in">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 text-base font-medium hover:bg-muted/50 transition-colors"
                      onClick={handleGoogleLogin}
                      disabled={isLoading || isGoogleLoading}
                    >
                      {isGoogleLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                      )}
                      Continue with Google
                    </Button>
                    
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-3 text-muted-foreground font-medium">Or continue with email</span>
                      </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@example.ie"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                          disabled={isLoading}
                          className="h-12 text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            className="h-12 text-base pr-12"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-4 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <Eye className="h-5 w-5 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        variant="hero"
                        className="w-full h-12 text-base font-semibold"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Signup Tab */}
                  <TabsContent value="signup" className="space-y-4 animate-fade-in">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 text-base font-medium hover:bg-muted/50 transition-colors"
                      onClick={handleGoogleLogin}
                      disabled={isLoading || isGoogleLoading}
                    >
                      {isGoogleLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                      )}
                      Continue with Google
                    </Button>
                    
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-3 text-muted-foreground font-medium">Or continue with email</span>
                      </div>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-name" className="text-sm font-medium">Full Name</Label>
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="Seán Murphy"
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            required
                            disabled={isLoading}
                            className="h-12 text-base"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-location" className="text-sm font-medium">Location</Label>
                          <Input
                            id="signup-location"
                            type="text"
                            placeholder="Dublin, Cork..."
                            value={signupLocation}
                            onChange={(e) => setSignupLocation(e.target.value)}
                            required
                            disabled={isLoading}
                            className="h-12 text-base"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.ie"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                          disabled={isLoading}
                          className="h-12 text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="At least 8 characters"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            minLength={8}
                            required
                            disabled={isLoading}
                            className="h-12 text-base pr-12"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-4 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <Eye className="h-5 w-5 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        {signupPassword && (
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center gap-2">
                              <Progress value={passwordStrength.score} className="h-2 flex-1" />
                              <span className={`text-xs font-semibold ${
                                passwordStrength.score < 40 ? 'text-destructive' :
                                passwordStrength.score < 70 ? 'text-yellow-600 dark:text-yellow-400' :
                                passwordStrength.score < 90 ? 'text-blue-600 dark:text-blue-400' :
                                'text-green-600 dark:text-green-400'
                              }`}>
                                {passwordStrength.label}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Use 12+ chars with uppercase, numbers & symbols
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3 rounded-xl border border-border p-4 bg-muted/30">
                        <p className="text-sm font-semibold text-foreground">Before signing up, please confirm:</p>
                        
                        <div className="space-y-3">
                          <label className="flex items-start gap-3 cursor-pointer group">
                            <Checkbox
                              id="terms"
                              checked={agreedToTerms}
                              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                              disabled={isLoading}
                              className="mt-0.5"
                            />
                            <span className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">
                              I have read the{" "}
                              <Link to="/terms" className="text-primary hover:underline font-medium">
                                Terms
                              </Link>{" "}
                              and{" "}
                              <Link to="/privacy" className="text-primary hover:underline font-medium">
                                Privacy Policy
                              </Link>
                            </span>
                          </label>

                          <label className="flex items-start gap-3 cursor-pointer group">
                            <Checkbox
                              id="disclaimer"
                              checked={agreedToDisclaimer}
                              onCheckedChange={(checked) => setAgreedToDisclaimer(checked as boolean)}
                              disabled={isLoading}
                              className="mt-0.5"
                            />
                            <span className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">
                              I understand SwapSkills is not responsible for services listed or personal safety
                            </span>
                          </label>

                          <label className="flex items-start gap-3 cursor-pointer group">
                            <Checkbox
                              id="conduct"
                              checked={agreedToConduct}
                              onCheckedChange={(checked) => setAgreedToConduct(checked as boolean)}
                              disabled={isLoading}
                              className="mt-0.5"
                            />
                            <span className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">
                              I commit to being kind and respectful
                            </span>
                          </label>
                        </div>
                      </div>
                      
                      <Button
                        type="submit"
                        variant="hero"
                        className="w-full h-12 text-base font-semibold"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          <>
                            Create Free Account
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Trust indicators - mobile only */}
            <div className="mt-6 grid grid-cols-3 gap-4 text-center lg:hidden">
              {[
                { icon: Users, label: "Local Community" },
                { icon: Shield, label: "Verified Users" },
                { icon: CheckCircle2, label: "100% Free" },
              ].map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4 lg:hidden">
              Join Ireland's skill-swapping community. Trade fairly, connect locally.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
