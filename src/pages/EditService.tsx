import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Loader2, ArrowLeft, Pencil, Gift, Search, RefreshCw, Zap, CalendarIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { allCategories, categoryLabels, categoryIcons } from "@/lib/categories";
import { postCategoryLabels } from "@/lib/postCategories";
import { ServiceCategory, PostCategory } from "@/types";
import { z } from "zod";
import { ImageUpload } from "@/components/services/ImageUpload";
import { SkillSelector } from "@/components/services/SkillSelector";
import { format } from "date-fns";
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

export default function EditService() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ServiceCategory | "">("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [postCategory, setPostCategory] = useState<PostCategory>("skill_swap");
  
  // Skills I'd accept in return
  const [acceptedSkills, setAcceptedSkills] = useState<string[]>([]);
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [openToGeneralOffers, setOpenToGeneralOffers] = useState(false);
  
  // Time-sensitive options
  const [isTimeSensitive, setIsTimeSensitive] = useState(false);
  const [neededByDate, setNeededByDate] = useState<Date | null>(null);
  const [neededByOption, setNeededByOption] = useState<"asap" | "date">("asap");

  // Fetch existing service
  const { data: service, isLoading: serviceLoading, error } = useQuery({
    queryKey: ["service-edit", id],
    queryFn: async () => {
      if (!id) throw new Error("Service ID is required");
      
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  // Populate form when service loads
  useEffect(() => {
    if (service) {
      setTitle(service.title || "");
      // Clean description - remove old "What I'd accept in return" format if present
      const descParts = (service.description || "").split("\n\n**What I'd accept in return:**");
      setDescription(descParts[0] || "");
      setCategory((service.category as ServiceCategory) || "");
      setLocation(service.location || "");
      setImages(service.images || []);
      setPostCategory((service.type as PostCategory) || "skill_swap");
      
      // Parse accepted_categories - now supports both open to all AND specific categories
      const acceptedCats = service.accepted_categories || [];
      const hasOpenToAll = acceptedCats.includes("_open_to_all_");
      setOpenToGeneralOffers(hasOpenToAll);
      
      const standardSkills: string[] = [];
      const customSkillsList: string[] = [];
      
      acceptedCats.forEach((cat: string) => {
        if (cat === "_open_to_all_") {
          // Skip, already handled
        } else if (cat.startsWith("custom:")) {
          customSkillsList.push(cat.replace("custom:", ""));
        } else {
          standardSkills.push(cat);
        }
      });
      
      setAcceptedSkills(standardSkills);
      setCustomSkills(customSkillsList);
      
      // Set time-sensitive fields
      setIsTimeSensitive(service.is_time_sensitive || false);
      if (service.needed_by_date) {
        setNeededByDate(new Date(service.needed_by_date));
        setNeededByOption("date");
      } else if (service.is_time_sensitive) {
        setNeededByOption("asap");
      }
    }
  }, [service]);

  // Redirect if not logged in or not owner
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please sign in to edit a service");
      navigate('/auth');
      return;
    }
    
    if (service && user && service.user_id !== user.id) {
      toast.error("You can only edit your own services");
      navigate('/browse');
    }
  }, [user, authLoading, service, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    if (!user || !id) {
      toast.error("Unable to update service");
      return;
    }

    setIsSubmitting(true);

    // Combine accepted skills - only for skill_swap
    const allAcceptedSkills = postCategory === "skill_swap"
      ? [
          ...acceptedSkills,
          ...customSkills.map(s => `custom:${s}`),
          ...(openToGeneralOffers ? ["_open_to_all_"] : [])
        ]
      : null;

    const { error } = await supabase
      .from("services")
      .update({
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        price: null,
        price_type: null,
        images: images.length > 0 ? images : null,
        accepted_categories: allAcceptedSkills,
        type: postCategory,
        is_time_sensitive: isTimeSensitive,
        needed_by_date: isTimeSensitive && neededByOption === "date" && neededByDate ? neededByDate.toISOString() : null,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating service:", error);
      toast.error("Failed to update service. Please try again.");
      setIsSubmitting(false);
      return;
    }

    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["service", id] });
    queryClient.invalidateQueries({ queryKey: ["services"] });
    queryClient.invalidateQueries({ queryKey: ["user-services"] });

    toast.success("Service updated successfully!");
    navigate(`/services/${id}`);
  };

  const getHeaderIcon = () => {
    switch (postCategory) {
      case "free_offer":
        return <Gift className="h-6 w-6 text-primary" />;
      case "help_request":
        return <Search className="h-6 w-6 text-primary" />;
      case "skill_swap":
        return <RefreshCw className="h-6 w-6 text-primary" />;
      default:
        return <Pencil className="h-6 w-6 text-primary" />;
    }
  };

  if (authLoading || serviceLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This service may have been removed or doesn't exist.
          </p>
          <Button onClick={() => navigate('/browse')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
      <Header />
      <main className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
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
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  {getHeaderIcon()}
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    Edit {postCategoryLabels[postCategory]}
                  </CardTitle>
                  <CardDescription>
                    Update your post details
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Post Type Display (not editable) */}
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm text-muted-foreground">
                    Post type: <span className="font-medium text-foreground">{postCategoryLabels[postCategory]}</span>
                  </p>
                </div>

                {/* Section 1: Details */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
                    <h3 className="font-semibold text-lg">
                      {postCategory === "help_request" ? "What You Need" : "What You're Offering"}
                    </h3>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Guitar Lessons for Beginners"
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
                      placeholder="Describe your skill and experience..."
                      rows={5}
                      disabled={isSubmitting}
                      maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground">{description.length}/1000 characters</p>
                  </div>

                  {/* Images */}
                  <div className="space-y-2">
                    <Label>Photos (optional)</Label>
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

                {/* Submit */}
                <div className="pt-4 flex gap-3">
                  <Button
                    type="submit"
                    variant="hero"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Pencil className="h-4 w-4 mr-2" />
                        Save Changes
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
      </main>
    </div>
  );
}
