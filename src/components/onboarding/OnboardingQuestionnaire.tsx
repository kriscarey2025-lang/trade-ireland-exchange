import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Sparkles, Search, Plus, X, ArrowRight, User, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { categoryLabels, categoryIcons, allCategories } from "@/lib/categories";
import { ServiceCategory } from "@/types";

type Step = "terms" | "profile" | "preferences";

export function OnboardingQuestionnaire() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [currentStep, setCurrentStep] = useState<Step>("terms");
  
  // Terms acceptance state
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(false);
  const [agreedToConduct, setAgreedToConduct] = useState(false);
  
  // Profile form state
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  
  // Preferences form state
  const [radius, setRadius] = useState([25]);
  const [skillsOffered, setSkillsOffered] = useState<ServiceCategory[]>([]);
  const [skillsWanted, setSkillsWanted] = useState<ServiceCategory[]>([]);
  const [customOffered, setCustomOffered] = useState<string[]>([]);
  const [customWanted, setCustomWanted] = useState<string[]>([]);
  const [newCustomOffered, setNewCustomOffered] = useState("");
  const [newCustomWanted, setNewCustomWanted] = useState("");

  // Check if profile is already complete
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, location")
        .eq("id", user.id)
        .maybeSingle();
      
      // Determine starting step based on profile completeness
      if (profile?.full_name && profile?.location) {
        // Profile is complete, skip terms and profile steps - go to preferences
        // For Google users coming back, they already accepted terms during onboarding
        setCurrentStep("preferences");
      } else {
        // New users need to accept terms first, then complete profile
        setCurrentStep("terms");
        // Pre-fill from profile if available
        setFullName(profile?.full_name || "");
        setLocation(profile?.location || "");
      }
      
      setCheckingProfile(false);
    };
    
    checkProfile();
  }, [user]);

  const toggleSkillOffered = (category: ServiceCategory) => {
    setSkillsOffered(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleSkillWanted = (category: ServiceCategory) => {
    setSkillsWanted(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const addCustomOffered = () => {
    const trimmed = newCustomOffered.trim();
    if (trimmed && !customOffered.includes(trimmed) && customOffered.length < 5) {
      setCustomOffered([...customOffered, trimmed]);
      setNewCustomOffered("");
    }
  };

  const addCustomWanted = () => {
    const trimmed = newCustomWanted.trim();
    if (trimmed && !customWanted.includes(trimmed) && customWanted.length < 5) {
      setCustomWanted([...customWanted, trimmed]);
      setNewCustomWanted("");
    }
  };

  const removeCustomOffered = (skill: string) => {
    setCustomOffered(customOffered.filter(s => s !== skill));
  };

  const removeCustomWanted = (skill: string) => {
    setCustomWanted(customWanted.filter(s => s !== skill));
  };

  const handleTermsSubmit = async () => {
    if (!agreedToTerms || !agreedToDisclaimer || !agreedToConduct) {
      toast.error("Please agree to all required conditions to continue");
      return;
    }
    
    // Record T&C acceptance timestamp for compliance
    if (user) {
      await supabase
        .from("user_preferences")
        .update({ terms_accepted_at: new Date().toISOString() })
        .eq("user_id", user.id);
    }
    
    setCurrentStep("profile");
  };

  const handleProfileSubmit = async () => {
    if (!user) return;

    if (!fullName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!location.trim()) {
      toast.error("Please enter your location");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        location: location.trim(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile. Please try again.");
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setCurrentStep("preferences");
  };

  const handlePreferencesSubmit = async () => {
    if (!user) return;

    if (skillsOffered.length === 0 && customOffered.length === 0) {
      toast.error("Please select at least one skill you can offer");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from("user_preferences")
      .update({
        service_radius_km: radius[0],
        skills_offered: skillsOffered,
        skills_offered_custom: customOffered,
        skills_wanted: skillsWanted,
        skills_wanted_custom: customWanted,
        onboarding_completed: true,
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences. Please try again.");
      setIsLoading(false);
      return;
    }

    toast.success("You're all set! Let's find you some matches.");
    navigate("/");
  };

  const handleSkip = async () => {
    if (!user) return;
    
    // If skipping from profile step, still need to ensure we don't block them forever
    if (currentStep === "profile") {
      if (!fullName.trim() || !location.trim()) {
        toast.error("Please complete your profile to continue");
        return;
      }
    }
    
    await supabase
      .from("user_preferences")
      .update({ onboarding_completed: true })
      .eq("user_id", user.id);
    
    navigate("/");
  };

  const getStepIndex = () => {
    switch (currentStep) {
      case "terms": return 0;
      case "profile": return 1;
      case "preferences": return 2;
      default: return 0;
    }
  };

  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center text-3xl mb-4">
            🤝
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to SwapSkills!</h1>
          <p className="text-muted-foreground">
            {currentStep === "terms" 
              ? "Please review and accept our community guidelines."
              : currentStep === "profile" 
              ? "Let's set up your profile first."
              : "Tell us about your skills so we can help you find great matches."}
          </p>
          
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`w-3 h-3 rounded-full ${getStepIndex() >= 0 ? "bg-primary" : "bg-primary/30"}`} />
            <div className={`w-3 h-3 rounded-full ${getStepIndex() >= 1 ? "bg-primary" : "bg-primary/30"}`} />
            <div className={`w-3 h-3 rounded-full ${getStepIndex() >= 2 ? "bg-primary" : "bg-primary/30"}`} />
          </div>
        </div>

        {currentStep === "terms" ? (
          <div className="space-y-6">
            {/* Terms & Conditions */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Community Guidelines</CardTitle>
                </div>
                <CardDescription>
                  Before joining, please confirm you understand and agree to our community standards.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 rounded-lg border border-border p-4 bg-muted/30">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="terms" className="cursor-pointer leading-snug">
                        I agree to the{" "}
                        <Link to="/terms" className="text-primary hover:underline" target="_blank">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="text-primary hover:underline" target="_blank">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="disclaimer"
                      checked={agreedToDisclaimer}
                      onCheckedChange={(checked) => setAgreedToDisclaimer(checked as boolean)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="disclaimer" className="cursor-pointer leading-snug">
                        I understand that SwapSkills is a platform for connecting people and does not verify, guarantee, or endorse any services or users
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="conduct"
                      checked={agreedToConduct}
                      onCheckedChange={(checked) => setAgreedToConduct(checked as boolean)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="conduct" className="cursor-pointer leading-snug">
                        I will treat all members with respect, conduct myself honestly, and follow the{" "}
                        <Link to="/safety" className="text-primary hover:underline" target="_blank">
                          Safety Guidelines
                        </Link>
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="hero"
                className="flex-1"
                onClick={handleTermsSubmit}
                disabled={!agreedToTerms || !agreedToDisclaimer || !agreedToConduct}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : currentStep === "profile" ? (
          <div className="space-y-6">
            {/* Profile Setup */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Your Profile</CardTitle>
                </div>
                <CardDescription>
                  This helps other members know who they're connecting with.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="Dublin, Cork, Galway..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    This helps us match you with people nearby.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="hero"
                className="flex-1"
                onClick={handleProfileSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Radius */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Service Radius</CardTitle>
                </div>
                <CardDescription>
                  How far are you willing to travel for services?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Slider
                    value={radius}
                    onValueChange={setRadius}
                    min={5}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>5 km</span>
                    <span className="font-semibold text-foreground">{radius[0]} km</span>
                    <span>100 km</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Offered */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Skills You Can Offer</CardTitle>
                </div>
                <CardDescription>
                  What services or skills can you provide to others?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {allCategories.filter(c => c !== "other").map((category) => (
                    <div
                      key={category}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                        skillsOffered.includes(category)
                          ? "bg-primary/10 border-primary"
                          : "bg-background border-border hover:border-primary/50"
                      }`}
                      onClick={() => toggleSkillOffered(category)}
                    >
                      <Checkbox
                        checked={skillsOffered.includes(category)}
                        className="pointer-events-none"
                      />
                      <span className="text-sm">
                        {categoryIcons[category]} {categoryLabels[category]}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Custom skills */}
                <div className="pt-2 border-t border-border">
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Add custom skills (up to 5)
                  </Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="e.g., Beekeeping, Calligraphy..."
                      value={newCustomOffered}
                      onChange={(e) => setNewCustomOffered(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomOffered())}
                      maxLength={50}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addCustomOffered}
                      disabled={!newCustomOffered.trim() || customOffered.length >= 5}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {customOffered.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {customOffered.map((skill) => (
                        <Badge key={skill} variant="secondary" className="gap-1">
                          {skill}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => removeCustomOffered(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Skills Wanted */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-accent-foreground" />
                  <CardTitle className="text-lg">Skills You're Looking For</CardTitle>
                </div>
                <CardDescription>
                  What services would you like to receive from others?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {allCategories.filter(c => c !== "other").map((category) => (
                    <div
                      key={category}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                        skillsWanted.includes(category)
                          ? "bg-accent/20 border-accent"
                          : "bg-background border-border hover:border-accent/50"
                      }`}
                      onClick={() => toggleSkillWanted(category)}
                    >
                      <Checkbox
                        checked={skillsWanted.includes(category)}
                        className="pointer-events-none"
                      />
                      <span className="text-sm">
                        {categoryIcons[category]} {categoryLabels[category]}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Custom skills */}
                <div className="pt-2 border-t border-border">
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Add custom skills (up to 5)
                  </Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="e.g., Piano lessons, Car repair..."
                      value={newCustomWanted}
                      onChange={(e) => setNewCustomWanted(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomWanted())}
                      maxLength={50}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addCustomWanted}
                      disabled={!newCustomWanted.trim() || customWanted.length >= 5}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {customWanted.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {customWanted.map((skill) => (
                        <Badge key={skill} variant="outline" className="gap-1">
                          {skill}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => removeCustomWanted(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="ghost"
                className="order-2 sm:order-1"
                onClick={handleSkip}
                disabled={isLoading}
              >
                Skip for now
              </Button>
              <Button
                variant="hero"
                className="flex-1 order-1 sm:order-2"
                onClick={handlePreferencesSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
