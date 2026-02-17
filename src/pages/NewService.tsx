import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Sparkles, Search, Gift, RefreshCw, AlertTriangle, Zap, CalendarIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { allCategories, categoryLabels, categoryIcons } from "@/lib/categories";
import { postCategoryLabels, postCategoryDescriptions, postCategoryIcons, postCategoryColors } from "@/lib/postCategories";
import { ServiceCategory, PostCategory } from "@/types";
import { z } from "zod";
import { ImageUpload } from "@/components/services/ImageUpload";
import { SkillSelector } from "@/components/services/SkillSelector";
import { trackServiceCreated } from "@/hooks/useEngagementTracking";
import { useContentModeration } from "@/hooks/useContentModeration";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { trackServiceCreatedHubSpot } from "@/hooks/useHubSpot";
import { PostCreationMatchDialog } from "@/components/services/PostCreationMatchDialog";
import { BoostOfferCard } from "@/components/services/BoostOfferCard";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";

const serviceSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().trim().min(20, "Description must be at least 20 characters").max(1000, "Description must be less than 1000 characters"),
  category: z.string().min(1, "Please select a category"),
  location: z.string().trim().min(2, "Location is required").max(100),
});

const locations = [
  "Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", 
  "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", 
  "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan", 
  "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", 
  "Westmeath", "Wexford", "Wicklow"
];

export default function NewService() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { checkContent, isChecking } = useContentModeration();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moderationWarning, setModerationWarning] = useState<string | null>(null);
  
  // Match dialog state
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [createdServiceId, setCreatedServiceId] = useState<string | null>(null);
  const [showBoostOffer, setShowBoostOffer] = useState(false);
  
  // Get initial post category from URL param, default to skill_swap
  const getInitialPostCategory = (): PostCategory => {
    const typeParam = searchParams.get("type");
    if (typeParam === "free_offer" || typeParam === "help_request" || typeParam === "skill_swap") {
      return typeParam;
    }
    return "skill_swap";
  };
  
  const [postCategory, setPostCategory] = useState<PostCategory>(getInitialPostCategory());
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ServiceCategory | "">("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<string[]>([]);
  
  // Skills I'd accept in return (only for skill_swap)
  const [acceptedSkills, setAcceptedSkills] = useState<string[]>([]);
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [openToGeneralOffers, setOpenToGeneralOffers] = useState(false);
  
  // Time-sensitive options
  const [isTimeSensitive, setIsTimeSensitive] = useState(false);
  const [neededByDate, setNeededByDate] = useState<Date | null>(null);
  const [neededByOption, setNeededByOption] = useState<"asap" | "date">("asap");

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please sign in to post a service");
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const result = serviceSchema.safeParse({
      title,
      description,
      category,
      location,
    });

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    // Only validate exchange preferences for skill_swap
    if (postCategory === "skill_swap") {
      if (!openToGeneralOffers && acceptedSkills.length === 0 && customSkills.length === 0) {
        toast.error("Please select at least one skill you'd accept in return, or toggle 'Open to General Offers'");
        return;
      }
    }

    if (!user) {
      toast.error("Please sign in to post a service");
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);
    setModerationWarning(null);

    // Check content with AI moderation
    const moderationResult = await checkContent(title.trim(), description.trim());
    
    // Combine accepted skills - only for skill_swap
    const allAcceptedSkills = postCategory === "skill_swap" 
      ? [
          ...acceptedSkills,
          ...customSkills.map(s => `custom:${s}`),
          ...(openToGeneralOffers ? ["_open_to_all_"] : [])
        ]
      : null;

    // Determine moderation status
    const moderationStatus = moderationResult.approved ? 'approved' : 'pending_review';
    const moderationReason = moderationResult.reason;

    const { data: newService, error } = await supabase.from("services").insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category,
      location: location.trim(),
      price: null,
      price_type: null,
      status: "active",
      images: images.length > 0 ? images : null,
      accepted_categories: allAcceptedSkills,
      type: postCategory,
      moderation_status: moderationStatus,
      moderation_reason: moderationReason,
      is_time_sensitive: isTimeSensitive,
      needed_by_date: isTimeSensitive && neededByOption === "date" && neededByDate ? neededByDate.toISOString() : null,
    }).select().single();

    if (error) {
      console.error("Error creating service:", error);
      toast.error("Failed to create service. Please try again.");
      setIsSubmitting(false);
      return;
    }

    // Track service creation
    trackServiceCreated(user.id, newService.id, title.trim());
    
    // Track in HubSpot
    if (user.email) {
      trackServiceCreatedHubSpot(user.email, title.trim(), category, postCategory);
    }

    if (!moderationResult.approved) {
      // Notify admins about flagged content
      supabase.functions.invoke('notify-admins-moderation', {
        body: {
          serviceId: newService.id,
          serviceTitle: title.trim(),
          moderationReason: moderationResult.reason || 'Content flagged for review',
          posterName: user.email || 'Unknown user'
        }
      }).catch(err => console.error('Failed to notify admins:', err));

      toast.warning("Your post has been submitted for review", {
        description: moderationResult.reason || "Our system flagged some content. An admin will review it shortly.",
        duration: 8000,
      });
      setModerationWarning(moderationResult.reason || "Your post is being reviewed by our team.");
    } else {
      toast.success("Posted successfully!");
    }
    
    setIsSubmitting(false);
    
    // For skill_swap posts, show the match dialog (which navigates to matches)
    // then show boost offer. For other types, show boost offer directly.
    if (postCategory === "skill_swap" && moderationResult.approved) {
      setCreatedServiceId(newService.id);
      setShowMatchDialog(true);
    } else if (moderationResult.approved) {
      setCreatedServiceId(newService.id);
      setShowBoostOffer(true);
    } else {
      navigate("/browse");
    }
  };

  const getHeaderIcon = () => {
    switch (postCategory) {
      case "free_offer":
        return <Gift className="h-6 w-6 text-white" />;
      case "help_request":
        return <Search className="h-6 w-6 text-white" />;
      case "skill_swap":
        return <RefreshCw className="h-6 w-6 text-white" />;
    }
  };

  const getHeaderTitle = () => {
    switch (postCategory) {
      case "free_offer":
        return "Offer for Free";
      case "help_request":
        return "Request Help";
      case "skill_swap":
        return "Skill Swap";
    }
  };

  const getHeaderDescription = () => {
    switch (postCategory) {
      case "free_offer":
        return "Share your skills with the community for free";
      case "help_request":
        return "Tell the community what you need help with";
      case "skill_swap":
        return "Trade your skills for services you need";
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
      <Header />
      <main className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Card className="shadow-elevated border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center">
                  {getHeaderIcon()}
                </div>
                <div>
                  <CardTitle className="text-2xl">{getHeaderTitle()}</CardTitle>
                  <CardDescription>{getHeaderDescription()}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form id="new-service-form" onSubmit={handleSubmit} className="space-y-8 pb-24 md:pb-0">
                {/* Post Type Selection */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">What type of post is this?</Label>
                  <RadioGroup 
                    value={postCategory} 
                    onValueChange={(v) => setPostCategory(v as PostCategory)}
                    className="grid gap-3"
                  >
                    {(["free_offer", "help_request", "skill_swap"] as PostCategory[]).map((type) => {
                      const colors = postCategoryColors[type];
                      return (
                        <label
                          key={type}
                          className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            postCategory === type 
                              ? `${colors.border} ${colors.bg}` 
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <RadioGroupItem value={type} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span>{postCategoryIcons[type]}</span>
                              <span className="font-semibold">{postCategoryLabels[type]}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {postCategoryDescriptions[type]}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </RadioGroup>
                </div>

                {/* Section 1: Your Skill / What You Need */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
                    <h3 className="font-semibold text-lg">
                      {postCategory === "help_request" ? "What You Need" : "What You're Offering"}
                    </h3>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      {postCategory === "help_request" ? "What do you need? *" : "Title *"}
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={postCategory === "help_request" 
                        ? "e.g., Need help with garden landscaping"
                        : "e.g., Guitar Lessons for Beginners"
                      }
                      disabled={isSubmitting}
                      maxLength={100}
                    />
                    <p className="text-xs text-muted-foreground">{title.length}/100 characters</p>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={category}
                      onValueChange={(value) => setCategory(value as ServiceCategory)}
                      disabled={isSubmitting}
                    >
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

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={postCategory === "help_request"
                        ? "Describe what you need in detail. Include any specific requirements, timeline, or preferences..."
                        : "Describe what you're offering. What will you provide? What's your experience level?"
                      }
                      rows={5}
                      disabled={isSubmitting}
                      maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground">{description.length}/1000 characters</p>
                  </div>

                  {/* Images */}
                  <div className="space-y-2">
                    <Label>Photos (optional)</Label>
                    <p className="text-sm text-muted-foreground">
                      Add photos to showcase your skill or previous work
                    </p>
                    {user && (
                      <ImageUpload
                        userId={user.id}
                        images={images}
                        onImagesChange={setImages}
                        maxImages={4}
                        disabled={isSubmitting}
                      />
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Select
                      value={location}
                      onValueChange={setLocation}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Section 2: What You'd Accept in Return - ONLY for skill_swap */}
                {postCategory === "skill_swap" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
                      <h3 className="font-semibold text-lg">What You'd Accept in Return</h3>
                    </div>

                    <SkillSelector
                      selectedSkills={acceptedSkills}
                      onSkillsChange={setAcceptedSkills}
                      customSkills={customSkills}
                      onCustomSkillsChange={setCustomSkills}
                      openToGeneralOffers={openToGeneralOffers}
                      onOpenToGeneralOffersChange={setOpenToGeneralOffers}
                      disabled={isSubmitting}
                      label="Skills I'd Accept in Return"
                      description="Select the types of services you'd be open to receiving as a trade"
                    />
                  </div>
                )}

                {/* Section: Time Sensitive */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-sm font-bold">
                      <Zap className="h-3.5 w-3.5" />
                    </span>
                    <h3 className="font-semibold text-lg">Time Sensitive?</h3>
                    <span className="text-sm text-muted-foreground">(optional)</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                      <div className="space-y-1">
                        <Label htmlFor="time-sensitive" className="text-base font-medium cursor-pointer">
                          This is time sensitive
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Let others know you need this urgently
                        </p>
                      </div>
                      <Switch
                        id="time-sensitive"
                        checked={isTimeSensitive}
                        onCheckedChange={(checked) => {
                          setIsTimeSensitive(checked);
                          if (!checked) {
                            setNeededByDate(null);
                            setNeededByOption("asap");
                          }
                        }}
                        disabled={isSubmitting}
                      />
                    </div>

                    {isTimeSensitive && (
                      <div className="space-y-3 pl-4 border-l-2 border-orange-400">
                        <Label className="text-sm font-medium">When do you need this by?</Label>
                        <RadioGroup
                          value={neededByOption}
                          onValueChange={(v) => {
                            setNeededByOption(v as "asap" | "date");
                            if (v === "asap") {
                              setNeededByDate(null);
                            }
                          }}
                          className="space-y-2"
                        >
                          <label className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                            neededByOption === "asap" ? "border-orange-400 bg-orange-50 dark:bg-orange-950/30" : "border-border hover:border-orange-300"
                          )}>
                            <RadioGroupItem value="asap" />
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-orange-500" />
                              <span className="font-medium">ASAP - As soon as possible</span>
                            </div>
                          </label>

                          <label className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                            neededByOption === "date" ? "border-orange-400 bg-orange-50 dark:bg-orange-950/30" : "border-border hover:border-orange-300"
                          )}>
                            <RadioGroupItem value="date" />
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-orange-500" />
                              <span className="font-medium">Specific date</span>
                            </div>
                          </label>
                        </RadioGroup>

                        {neededByOption === "date" && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !neededByDate && "text-muted-foreground"
                                )}
                                disabled={isSubmitting}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {neededByDate ? format(neededByDate, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={neededByDate || undefined}
                                onSelect={(date) => setNeededByDate(date || null)}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit - Desktop */}
                <div className="hidden md:flex pt-4 gap-3">
                  <Button
                    type="submit"
                    variant="hero"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        {getHeaderIcon()}
                        <span className="ml-2">Post {postCategoryLabels[postCategory]}</span>
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Sticky Submit Button */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-xl border-t border-border safe-area-bottom">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className="flex-shrink-0"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="new-service-form"
              variant="hero"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  {getHeaderIcon()}
                  <span className="ml-2">Post</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      {/* Boost offer for non-skill-swap posts */}
      {showBoostOffer && createdServiceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-lg w-full">
            <BoostOfferCard
              serviceId={createdServiceId}
              onDismiss={() => {
                setShowBoostOffer(false);
                navigate("/browse");
              }}
            />
          </div>
        </div>
      )}

      {/* Post-creation match dialog (skill_swap only) */}
      {user && createdServiceId && (
        <PostCreationMatchDialog
          open={showMatchDialog}
          onOpenChange={(open) => {
            setShowMatchDialog(open);
            if (!open) {
              navigate("/browse");
            }
          }}
          newServiceId={createdServiceId}
          newServiceTitle={title}
          newServiceCategory={category}
          userId={user.id}
          userLocation={location}
        />
      )}
    </div>
  );
}
