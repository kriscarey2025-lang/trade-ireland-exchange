import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Loader2, ArrowLeft, Sparkles } from "lucide-react";
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

const locations = ["Dublin", "Cork", "Galway", "Limerick", "Waterford", "Kilkenny", "Sligo", "Wexford", "Other"];

export default function NewService() {
  const navigate = useNavigate();
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
      price: price ? parseFloat(price) : undefined,
      price_type: priceType,
    });

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    if (!user) {
      toast.error("Please sign in to post a service");
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("services").insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category,
      location: location.trim(),
      price: price ? parseFloat(price) : null,
      price_type: priceType,
      status: "active",
      images: images.length > 0 ? images : null,
      accepted_categories: acceptedCategories.length > 0 ? acceptedCategories : null,
    });

    if (error) {
      console.error("Error creating service:", error);
      toast.error("Failed to create service. Please try again.");
      setIsSubmitting(false);
      return;
    }

    toast.success("Service posted successfully!");
    navigate('/browse');
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
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Post a Service</CardTitle>
                  <CardDescription>
                    Share your skills with the community
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Service Title *</Label>
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
                    placeholder="Describe your service in detail. Include your experience, what's included, and any requirements..."
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

                {/* Price (optional) */}
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

                {/* Accepted Categories in Return */}
                <div className="space-y-3">
                  <Label>Accept in Return (optional)</Label>
                  <p className="text-sm text-muted-foreground">
                    Select which types of services you would accept as a trade
                  </p>
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
                      {acceptedCategories.length} categor{acceptedCategories.length === 1 ? 'y' : 'ies'} selected
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
                        Posting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Post Service
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
