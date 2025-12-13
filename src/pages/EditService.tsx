import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

const serviceSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().trim().min(20, "Description must be at least 20 characters").max(1000, "Description must be less than 1000 characters"),
  category: z.string().min(1, "Please select a category"),
  location: z.string().trim().min(2, "Location is required").max(100),
  acceptInReturn: z.string().trim().min(10, "Please describe what you'd accept in return (at least 10 characters)").max(500, "Maximum 500 characters"),
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
  const [acceptInReturn, setAcceptInReturn] = useState("");
  const [serviceType, setServiceType] = useState<"offer" | "request">("offer");

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
      // Extract the accept in return from description if it exists
      const descParts = (service.description || "").split("\n\n**What I'd accept in return:**");
      setDescription(descParts[0] || "");
      setAcceptInReturn(descParts[1]?.trim() || "");
      setCategory((service.category as ServiceCategory) || "");
      setLocation(service.location || "");
      setImages(service.images || []);
      setServiceType((service.type as "offer" | "request") || "offer");
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
      acceptInReturn,
    });

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    if (!user || !id) {
      toast.error("Unable to update service");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from("services")
      .update({
        title: title.trim(),
        description: `${description.trim()}\n\n**What I'd accept in return:** ${acceptInReturn.trim()}`,
        category,
        location: location.trim(),
        price: null,
        price_type: "negotiable",
        images: images.length > 0 ? images : null,
        accepted_categories: null,
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
                    Edit {isRequest ? "Request" : "Service"}
                  </CardTitle>
                  <CardDescription>
                    Update your {isRequest ? "request" : "service"} details
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    {isRequest ? "What do you need? *" : "Service Title *"}
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
                    {isRequest ? "Category of service needed *" : "Category *"}
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
                      : "Describe your service in detail..."
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

                {/* What I'd Accept in Return */}
                <div className="space-y-2">
                  <Label htmlFor="acceptInReturn">
                    {isRequest ? "What I Can Offer in Return *" : "What I'd Accept in Return *"}
                  </Label>
                  <Textarea
                    id="acceptInReturn"
                    value={acceptInReturn}
                    onChange={(e) => setAcceptInReturn(e.target.value)}
                    placeholder={isRequest
                      ? "Describe what skills or services you can offer as a trade..."
                      : "Describe what you'd be open to receiving as a trade..."
                    }
                    rows={3}
                    disabled={isSubmitting}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">{acceptInReturn.length}/500 characters</p>
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
