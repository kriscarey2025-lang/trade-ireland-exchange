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
import { toast } from "sonner";
import { Loader2, ArrowLeft, Sparkles, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { allCategories, categoryLabels, categoryIcons } from "@/lib/categories";
import { ServiceCategory } from "@/types";
import { z } from "zod";
import { ImageUpload } from "@/components/services/ImageUpload";
import { SkillSelector } from "@/components/services/SkillSelector";
import { trackServiceCreated } from "@/hooks/useEngagementTracking";

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
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Determine if this is an offer or request based on URL param
  const serviceType = searchParams.get("type") === "request" ? "request" : "offer";
  const isRequest = serviceType === "request";
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ServiceCategory | "">("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<string[]>([]);
  
  // Skills I'd accept in return
  const [acceptedSkills, setAcceptedSkills] = useState<string[]>([]);
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [openToGeneralOffers, setOpenToGeneralOffers] = useState(false);

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

    // Check that at least one skill/category is selected or open to general offers
    if (!openToGeneralOffers && acceptedSkills.length === 0 && customSkills.length === 0) {
      toast.error("Please select at least one skill you'd accept in return, or toggle 'Open to General Offers'");
      return;
    }

    if (!user) {
      toast.error("Please sign in to post a service");
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);

    // Combine accepted skills - include both specific categories AND open to all if selected
    const allAcceptedSkills = [
      ...acceptedSkills,
      ...customSkills.map(s => `custom:${s}`),
      ...(openToGeneralOffers ? ["_open_to_all_"] : [])
    ];

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
      type: serviceType,
    }).select().single();

    if (error) {
      console.error("Error creating service:", error);
      toast.error("Failed to create service. Please try again.");
      setIsSubmitting(false);
      return;
    }

    // Track service creation
    trackServiceCreated(user.id, newService.id, title.trim());

    toast.success(isRequest ? "Request posted successfully!" : "Service posted successfully!");
    navigate("/browse");
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
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isRequest ? "bg-accent" : "bg-gradient-hero"}`}>
                  {isRequest ? (
                    <Search className="h-6 w-6 text-accent-foreground" />
                  ) : (
                    <Sparkles className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {isRequest ? "Request a Service" : "Offer Your Skill"}
                  </CardTitle>
                  <CardDescription>
                    {isRequest 
                      ? "Tell the community what you need help with"
                      : "Share your skills and choose what you'd like in return"
                    }
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Your Skill */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
                    <h3 className="font-semibold text-lg">
                      {isRequest ? "What You Need" : "Your Skill"}
                    </h3>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      {isRequest ? "What do you need? *" : "Skill / Service Title *"}
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={isRequest 
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
                    <Label htmlFor="category">
                      {isRequest ? "Category of service needed *" : "Skill Category *"}
                    </Label>
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
                      placeholder={isRequest
                        ? "Describe what you need in detail. Include any specific requirements, timeline, or preferences..."
                        : "Describe your skill and experience. What will you provide? What's your experience level?"
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

                {/* Section 2: What You'd Accept in Return */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
                    <h3 className="font-semibold text-lg">
                      {isRequest ? "What You Can Offer" : "What You'd Accept in Return"}
                    </h3>
                  </div>

                  <SkillSelector
                    selectedSkills={acceptedSkills}
                    onSkillsChange={setAcceptedSkills}
                    customSkills={customSkills}
                    onCustomSkillsChange={setCustomSkills}
                    openToGeneralOffers={openToGeneralOffers}
                    onOpenToGeneralOffersChange={setOpenToGeneralOffers}
                    disabled={isSubmitting}
                    label={isRequest ? "Skills I Can Offer" : "Skills I'd Accept in Return"}
                    description={isRequest 
                      ? "Select what you can offer as a trade for the service you need"
                      : "Select the types of services you'd be open to receiving as a trade"
                    }
                  />
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
                        Posting...
                      </>
                    ) : isRequest ? (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Post Request
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Post Skill
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
