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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
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
  price: z.number().min(0, "Price must be 0 or greater").max(10000).optional(),
  price_type: z.enum(["fixed", "hourly", "negotiable"]),
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
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState<"fixed" | "hourly" | "negotiable">("negotiable");
  const [images, setImages] = useState<string[]>([]);
  const [acceptedCategories, setAcceptedCategories] = useState<ServiceCategory[]>([]);
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
      setDescription(service.description || "");
      setCategory((service.category as ServiceCategory) || "");
      setLocation(service.location || "");
      setPrice(service.price?.toString() || "");
      setPriceType((service.price_type as "fixed" | "hourly" | "negotiable") || "negotiable");
      setImages(service.images || []);
      setAcceptedCategories((service.accepted_categories as ServiceCategory[]) || []);
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
      price: price ? parseFloat(price) : undefined,
      price_type: priceType,
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
        description: description.trim(),
        category,
        location: location.trim(),
        price: price ? parseFloat(price) : null,
        price_type: priceType,
        images: images.length > 0 ? images : null,
        accepted_categories: acceptedCategories.length > 0 ? acceptedCategories : null,
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

                {/* Pricing Type */}
                <div className="space-y-3">
                  <Label>Pricing Type *</Label>
                  <RadioGroup
                    value={priceType}
                    onValueChange={(value) => setPriceType(value as "fixed" | "hourly" | "negotiable")}
                    disabled={isSubmitting}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="negotiable" id="negotiable" />
                      <Label htmlFor="negotiable" className="font-normal cursor-pointer">
                        Negotiable / Trade
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fixed" id="fixed" />
                      <Label htmlFor="fixed" className="font-normal cursor-pointer">
                        Fixed Price
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hourly" id="hourly" />
                      <Label htmlFor="hourly" className="font-normal cursor-pointer">
                        Hourly Rate
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Price */}
                {priceType !== "negotiable" && (
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      {priceType === "hourly" ? "Hourly Rate (€)" : "Price (€)"}
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      max="10000"
                      step="0.01"
                      disabled={isSubmitting}
                    />
                  </div>
                )}

                {/* Accepted Categories */}
                <div className="space-y-3">
                  <Label>
                    {isRequest ? "What I Can Offer in Return (optional)" : "What I'd Accept in Return (optional)"}
                  </Label>
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                    {allCategories.map((cat) => (
                      <div key={cat} className="flex items-center space-x-2">
                        <Checkbox
                          id={`accept-${cat}`}
                          checked={acceptedCategories.includes(cat)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setAcceptedCategories([...acceptedCategories, cat]);
                            } else {
                              setAcceptedCategories(acceptedCategories.filter(c => c !== cat));
                            }
                          }}
                          disabled={isSubmitting}
                        />
                        <Label 
                          htmlFor={`accept-${cat}`} 
                          className="font-normal cursor-pointer text-sm"
                        >
                          {categoryIcons[cat]} {categoryLabels[cat]}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {acceptedCategories.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {acceptedCategories.length} categor{acceptedCategories.length === 1 ? "y" : "ies"} selected
                    </p>
                  )}
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
