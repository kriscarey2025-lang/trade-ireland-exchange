import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  Sparkles, 
  Search, 
  Users,
  ShieldCheck,
  Bell,
  LinkIcon,
  Check,
  Wand2,
  Edit,
  PartyPopper,
  Gift,
  RefreshCw,
  MapPin
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { categoryLabels, categoryIcons, allCategories } from "@/lib/categories";
import { ServiceCategory, PostCategory } from "@/types";
import { trackServiceCreated } from "@/hooks/useEngagementTracking";
import { postCategoryLabels, postCategoryIcons } from "@/lib/postCategories";
import { ImageUpload } from "@/components/services/ImageUpload";

type WizardStep = "goal" | "details" | "generating" | "review" | "checklist" | "complete";

interface GeneratedPost {
  title: string;
  description: string;
  type: PostCategory;
  category: string;
}

const locations = [
  "Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", 
  "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", 
  "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan", 
  "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", 
  "Westmeath", "Wexford", "Wicklow"
];

interface GettingStartedWizardProps {
  onComplete?: () => void;
  embedded?: boolean;
}

export function GettingStartedWizard({ onComplete, embedded = false }: GettingStartedWizardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<WizardStep>("goal");
  const [isLoading, setIsLoading] = useState(false);
  
  // Step 1: Goal - now maps to PostCategory
  const [goal, setGoal] = useState<"free_offer" | "help_request" | "skill_swap" | "">("");
  
  // Step 2: Details
  const [experienceLevel, setExperienceLevel] = useState<"beginner" | "intermediate" | "expert" | "">("");
  const [engagementType, setEngagementType] = useState<"one_off" | "short_term" | "long_term" | "">("");
  const [skillCategory, setSkillCategory] = useState<ServiceCategory | "">("");
  const [skillDetails, setSkillDetails] = useState("");
  const [location, setLocation] = useState("");
  const [whatTheyWant, setWhatTheyWant] = useState("");
  
  // Step 4: Generated post (editable)
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  
  // Step 5: Checklist
  const [wantsVerification, setWantsVerification] = useState(false);
  const [wantsSocialLinks, setWantsSocialLinks] = useState(false);
  const [wantsWeeklyDigest, setWantsWeeklyDigest] = useState(false);

  const getProgress = () => {
    const steps: WizardStep[] = ["goal", "details", "generating", "review", "checklist", "complete"];
    const index = steps.indexOf(currentStep);
    return ((index + 1) / steps.length) * 100;
  };

  const handleGoalNext = () => {
    if (!goal) {
      toast.error("Please select what you'd like to do");
      return;
    }
    setCurrentStep("details");
  };

  const handleDetailsNext = async () => {
    // Experience level only required for free_offer and skill_swap
    if (goal !== "help_request" && !experienceLevel) {
      toast.error("Please select your experience level");
      return;
    }
    if (!skillCategory) {
      toast.error("Please select a skill category");
      return;
    }
    if (!skillDetails.trim()) {
      toast.error("Please describe your skill or what you need");
      return;
    }
    if (!location) {
      toast.error("Please select your location");
      return;
    }

    setCurrentStep("generating");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-service-post", {
        body: {
          goal,
          experienceLevel,
          engagementType: engagementType || undefined,
          skillCategory,
          skillDetails: skillDetails.trim(),
          location,
          whatTheyWant: whatTheyWant.trim() || undefined,
        },
      });

      if (error) throw error;

      setGeneratedPost(data);
      setEditedTitle(data.title);
      setEditedDescription(data.description);
      setCurrentStep("review");
    } catch (error) {
      console.error("Error generating post:", error);
      toast.error("Failed to generate post. Let's try creating it manually.");
      // Fallback - create a basic post
      const fallbackPost: GeneratedPost = {
        title: `${categoryLabels[skillCategory as ServiceCategory]} - ${location}`,
        description: skillDetails,
        type: goal as PostCategory,
        category: skillCategory,
      };
      setGeneratedPost(fallbackPost);
      setEditedTitle(fallbackPost.title);
      setEditedDescription(fallbackPost.description);
      setCurrentStep("review");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewNext = () => {
    if (!editedTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!editedDescription.trim() || editedDescription.trim().length < 20) {
      toast.error("Description must be at least 20 characters");
      return;
    }
    setCurrentStep("checklist");
  };

  const handlePublish = async () => {
    if (!user || !generatedPost) return;

    setIsLoading(true);

    try {
      // Create the service post
      const { data: newService, error: serviceError } = await supabase.from("services").insert({
        user_id: user.id,
        title: editedTitle.trim(),
        description: editedDescription.trim(),
        category: skillCategory,
        location: location,
        type: goal, // Use the goal directly as it maps to PostCategory
        status: "active",
        accepted_categories: goal === "skill_swap" ? ["_open_to_all_"] : null, // Only for skill swaps
        images: images.length > 0 ? images : null,
      }).select().single();

      if (serviceError) throw serviceError;

      // Track service creation
      trackServiceCreated(user.id, newService.id, editedTitle.trim());

      // Update user preferences for weekly digest
      if (wantsWeeklyDigest) {
        await supabase
          .from("user_preferences")
          .update({ weekly_digest_enabled: true })
          .eq("user_id", user.id);
      }

      setCurrentStep("complete");
      toast.success("Your post is live!");
    } catch (error) {
      console.error("Error publishing post:", error);
      toast.error("Failed to publish. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
    
    // Navigate based on checklist selections
    if (wantsVerification) {
      navigate("/profile?tab=verification");
    } else if (wantsSocialLinks) {
      navigate("/profile");
    } else {
      navigate("/browse");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "goal":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">What brings you here?</h2>
              <p className="text-muted-foreground">
                Let's figure out the best way to get you started
              </p>
            </div>

            <RadioGroup value={goal} onValueChange={(v) => setGoal(v as typeof goal)}>
              <div className="space-y-3">
                <label 
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    goal === "free_offer" ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-border hover:border-green-400"
                  }`}
                >
                  <RadioGroupItem value="free_offer" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Gift className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-semibold">Offer something for free</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Share your skills or give away items to help others
                    </p>
                  </div>
                </label>

                <label 
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    goal === "help_request" ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20" : "border-border hover:border-amber-400"
                  }`}
                >
                  <RadioGroupItem value="help_request" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Search className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      <span className="font-semibold">Ask for help</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Request help from the community without needing to give something back
                    </p>
                  </div>
                </label>

                <label 
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    goal === "skill_swap" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="skill_swap" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <RefreshCw className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Swap skills</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Trade your skills for something you need in return
                    </p>
                  </div>
                </label>
              </div>
            </RadioGroup>

            <Button 
              variant="hero" 
              className="w-full" 
              onClick={handleGoalNext}
              disabled={!goal}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

      case "details":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Tell us more</h2>
              <p className="text-muted-foreground">
                We'll use this to create a great post for you
              </p>
            </div>

            <div className="space-y-5">
              {/* Experience Level - only show for free_offer and skill_swap */}
              {goal !== "help_request" && (
                <div className="space-y-3">
                  <Label>How would you describe your experience?</Label>
                  <RadioGroup 
                    value={experienceLevel} 
                    onValueChange={(v) => setExperienceLevel(v as typeof experienceLevel)}
                    className="flex flex-wrap gap-2"
                  >
                    {[
                      { value: "beginner", label: "Just starting out" },
                      { value: "intermediate", label: "Got some experience" },
                      { value: "expert", label: "Years of practice" },
                    ].map((level) => (
                      <label
                        key={level.value}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer transition-all ${
                          experienceLevel === level.value 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={level.value} className="sr-only" />
                        <span className="text-sm font-medium">{level.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Engagement Type */}
              <div className="space-y-3">
                <Label>What type of arrangement are you looking for?</Label>
                <RadioGroup 
                  value={engagementType} 
                  onValueChange={(v) => setEngagementType(v as typeof engagementType)}
                  className="flex flex-wrap gap-2"
                >
                  {[
                    { value: "one_off", label: "One-off transaction" },
                    { value: "short_term", label: "Short-term project" },
                    { value: "long_term", label: "Long-term connection" },
                  ].map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer transition-all ${
                        engagementType === type.value 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={type.value} className="sr-only" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>What skill or service category?</Label>
                <Select value={skillCategory} onValueChange={(v) => setSkillCategory(v as ServiceCategory)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {categoryIcons[cat]} {categoryLabels[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Skill Details */}
              <div className="space-y-2">
                <Label>
                  {goal === "help_request" 
                    ? "Describe what you need help with" 
                    : "Describe your skill or what you can offer"
                  }
                </Label>
                <Textarea
                  value={skillDetails}
                  onChange={(e) => setSkillDetails(e.target.value)}
                  placeholder={goal === "help_request"
                    ? "e.g., I need help fixing a leaky tap in my kitchen..."
                    : "e.g., I can teach guitar - I've been playing for 10 years..."
                  }
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">{skillDetails.length}/500</p>
              </div>

              {/* What they want in return - only show for skill swaps */}
              {goal === "skill_swap" && (
                <div className="space-y-2">
                  <Label>What would you like in return?</Label>
                  <Input
                    value={whatTheyWant}
                    onChange={(e) => setWhatTheyWant(e.target.value)}
                    placeholder="e.g., Gardening help, cooking lessons, or anything!"
                    maxLength={200}
                  />
                </div>
              )}

              {/* Location */}
              <div className="space-y-2">
                <Label>Your location</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your county" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep("goal")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                variant="hero" 
                className="flex-1" 
                onClick={handleDetailsNext}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Generate My Post
              </Button>
            </div>
          </div>
        );

      case "generating":
        return (
          <div className="text-center py-12">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-hero flex items-center justify-center mb-6 animate-pulse">
              <Wand2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Creating your post...</h2>
            <p className="text-muted-foreground mb-6">
              Our AI is crafting something great for you
            </p>
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </div>
        );

      case "review":
        const getPostTypeBadgePreview = (type: PostCategory) => {
          switch (type) {
            case "free_offer":
              return { label: "🎁 Free Offer", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300" };
            case "help_request":
              return { label: "🙋 Looking for Help", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300" };
            case "skill_swap":
              return { label: "🔄 Skill Swap", className: "" };
          }
        };
        const previewBadge = getPostTypeBadgePreview(goal as PostCategory);
        
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-4">
                <Edit className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Review your post</h2>
              <p className="text-muted-foreground">
                Edit anything you'd like to change
              </p>
            </div>

            {/* Post Preview */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wide">Preview</Label>
              <Card className="border-2 border-dashed border-primary/30 bg-card/50">
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <Badge className={cn("shrink-0 rounded-lg", previewBadge.className)}>
                      {previewBadge.label}
                    </Badge>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-xs text-muted-foreground font-medium">
                      <span>{categoryIcons[skillCategory as ServiceCategory]}</span>
                      <span className="hidden sm:inline">{categoryLabels[skillCategory as ServiceCategory]}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-semibold text-lg mb-2 line-clamp-2">
                    {editedTitle || "Your title will appear here"}
                  </h3>

                  {/* Images Preview */}
                  {images.length > 0 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto">
                      {images.slice(0, 3).map((url, index) => (
                        <img
                          key={url}
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="h-16 w-16 rounded-lg object-cover shrink-0"
                        />
                      ))}
                      {images.length > 3 && (
                        <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center text-sm text-muted-foreground shrink-0">
                          +{images.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary text-xs font-medium text-secondary-foreground">
                      <MapPin className="h-3 w-3" />
                      {location}
                    </div>
                  </div>

                  {/* Open to all for skill swaps */}
                  {goal === "skill_swap" && (
                    <div className="mb-4">
                      <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-accent/10 border border-accent/30 shadow-sm">
                        <span className="text-sm">✨</span>
                        <span className="text-xs font-semibold text-accent">Open to all offers</span>
                      </div>
                    </div>
                  )}

                  {/* User preview */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="h-14 w-14 rounded-full ring-2 ring-background shadow-md shrink-0 bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold text-lg">You</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-sm truncate">Your Name</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground italic">
                        <span>No reviews yet</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Edit Fields */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Edit Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={6}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground">{editedDescription.length}/1000</p>
                </div>
                
                {/* Image Upload */}
                {user && (
                  <div className="space-y-2">
                    <Label>Photos (optional)</Label>
                    <ImageUpload
                      userId={user.id}
                      images={images}
                      onImagesChange={setImages}
                      maxImages={4}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep("details")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                variant="hero" 
                className="flex-1" 
                onClick={handleReviewNext}
              >
                Looks Good!
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case "checklist":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-highlight/20 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-highlight" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Almost there!</h2>
              <p className="text-muted-foreground">
                A few optional extras to help you stand out
              </p>
            </div>

            <div className="space-y-3">
              <label 
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  wantsVerification ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <Checkbox 
                  checked={wantsVerification} 
                  onCheckedChange={(c) => setWantsVerification(c as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Verify my identity</span>
                    <Badge variant="secondary" className="text-xs">Recommended</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get a verified badge on your profile. Members trust verified users more!
                  </p>
                </div>
              </label>

              <label 
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  wantsSocialLinks ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <Checkbox 
                  checked={wantsSocialLinks} 
                  onCheckedChange={(c) => setWantsSocialLinks(c as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <LinkIcon className="h-5 w-5 text-accent" />
                    <span className="font-semibold">Link social accounts</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add your LinkedIn, Instagram, or Facebook to build trust
                  </p>
                </div>
              </label>

              <label 
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  wantsWeeklyDigest ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <Checkbox 
                  checked={wantsWeeklyDigest} 
                  onCheckedChange={(c) => setWantsWeeklyDigest(c as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className="h-5 w-5 text-highlight" />
                    <span className="font-semibold">Weekly updates</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get notified about new matches and community activity
                  </p>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep("review")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                variant="hero" 
                className="flex-1" 
                onClick={handlePublish}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Publish My Post
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case "complete":
        return (
          <div className="text-center py-8">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-hero flex items-center justify-center mb-6">
              <PartyPopper className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">You're all set! 🎉</h2>
            <p className="text-muted-foreground mb-6">
              Your post is now live. Welcome to the community!
            </p>

            {(wantsVerification || wantsSocialLinks) && (
              <Card className="mb-6 text-left">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Next steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {wantsVerification && (
                    <div className="flex items-center gap-2 text-sm">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <span>Complete ID verification in your profile</span>
                    </div>
                  )}
                  {wantsSocialLinks && (
                    <div className="flex items-center gap-2 text-sm">
                      <LinkIcon className="h-4 w-4 text-accent" />
                      <span>Add social links to your profile</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Button variant="hero" onClick={handleComplete} className="w-full">
              {wantsVerification ? "Go to Verification" : wantsSocialLinks ? "Go to Profile" : "Browse Community"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
    }
  };

  const Container = embedded ? "div" : Card;

  return (
    <div className={embedded ? "" : "min-h-screen bg-gradient-to-b from-secondary/50 to-background py-8 px-4"}>
      <div className="max-w-lg mx-auto">
        {!embedded && (
          <div className="mb-6">
            <Progress value={getProgress()} className="h-2" />
          </div>
        )}
        
        {embedded ? (
          <div className="py-4">{renderStep()}</div>
        ) : (
          <Card className="shadow-elevated border-border/50">
            <CardContent className="p-6 md:p-8">
              {renderStep()}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
