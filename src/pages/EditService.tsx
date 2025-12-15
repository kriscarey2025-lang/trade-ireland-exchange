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
import { toast } from "sonner";
import { Loader2, ArrowLeft, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { allCategories, categoryLabels, categoryIcons } from "@/lib/categories";
import { ServiceCategory } from "@/types";
import { z } from "zod";
import { ImageUpload } from "@/components/services/ImageUpload";
import { SkillSelector } from "@/components/services/SkillSelector";

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
  const [serviceType, setServiceType] = useState<"offer" | "request">("offer");
  
  // Skills I'd accept in return
  const [acceptedSkills, setAcceptedSkills] = useState<string[]>([]);
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [openToGeneralOffers, setOpenToGeneralOffers] = useState(false);

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
      setServiceType((service.type as "offer" | "request") || "offer");
      
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

    // Check that at least one skill/category is selected or open to general offers
    if (!openToGeneralOffers && acceptedSkills.length === 0 && customSkills.length === 0) {
      toast.error("Please select at least one skill you'd accept in return, or toggle 'Open to General Offers'");
      return;
    }

    if (!user || !id) {
      toast.error("Unable to update service");
      return;
    }

    setIsSubmitting(true);

    // Combine accepted skills - include both specific categories AND open to all if selected
    const allAcceptedSkills = [
      ...acceptedSkills,
      ...customSkills.map(s => `custom:${s}`),
      ...(openToGeneralOffers ? ["_open_to_all_"] : [])
    ];

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

  const isRequest = serviceType === "request";

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
                  <Pencil className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    Edit {isRequest ? "Request" : "Skill"}
                  </CardTitle>
                  <CardDescription>
                    Update your {isRequest ? "request" : "skill"} details
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
                        ? "Describe what you need in detail..."
                        : "Describe your skill and experience..."
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
