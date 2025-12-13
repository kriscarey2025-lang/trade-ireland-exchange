import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Building2, Mail, Phone, Globe, MapPin, Megaphone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Advertiser {
  id: string;
  business_name: string;
  business_email: string;
  business_phone: string | null;
  business_website: string | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
}

interface Ad {
  id: string;
  advertiser_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  placement: string;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

const AdminAdvertisers = () => {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [isAdvertiserDialogOpen, setIsAdvertiserDialogOpen] = useState(false);
  const [isAdDialogOpen, setIsAdDialogOpen] = useState(false);
  const [selectedAdvertiser, setSelectedAdvertiser] = useState<Advertiser | null>(null);

  // Check admin status
  const { data: isAdmin, isLoading: isAdminLoading } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      return data ?? false;
    },
    enabled: !!user?.id,
  });

  // Fetch all advertisers (admin function needed)
  const { data: advertisers, isLoading: advertisersLoading } = useQuery({
    queryKey: ["advertisers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advertisers")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Advertiser[];
    },
    enabled: isAdmin === true,
  });

  // Fetch ads for selected advertiser
  const { data: ads } = useQuery({
    queryKey: ["ads", selectedAdvertiser?.id],
    queryFn: async () => {
      if (!selectedAdvertiser) return [];
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("advertiser_id", selectedAdvertiser.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Ad[];
    },
    enabled: !!selectedAdvertiser,
  });

  // Create advertiser mutation
  const createAdvertiser = useMutation({
    mutationFn: async (formData: FormData) => {
      const { error } = await supabase.from("advertisers").insert({
        business_name: formData.get("business_name") as string,
        business_email: formData.get("business_email") as string,
        business_phone: formData.get("business_phone") as string || null,
        business_website: formData.get("business_website") as string || null,
        location: formData.get("location") as string || null,
        user_id: null, // Admin-created, no user association
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertisers"] });
      setIsAdvertiserDialogOpen(false);
      toast.success("Advertiser created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create advertiser: " + error.message);
    },
  });

  // Create ad mutation
  const createAd = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!selectedAdvertiser) throw new Error("No advertiser selected");
      
      const { error } = await supabase.from("ads").insert({
        advertiser_id: selectedAdvertiser.id,
        title: formData.get("title") as string,
        description: formData.get("description") as string || null,
        image_url: formData.get("image_url") as string || null,
        link_url: formData.get("link_url") as string || null,
        placement: formData.get("placement") as string || "side",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads", selectedAdvertiser?.id] });
      setIsAdDialogOpen(false);
      toast.success("Ad created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create ad: " + error.message);
    },
  });

  // Toggle advertiser active status
  const toggleAdvertiserStatus = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("advertisers")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertisers"] });
      toast.success("Advertiser status updated");
    },
  });

  // Toggle ad active status
  const toggleAdStatus = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("ads")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads", selectedAdvertiser?.id] });
      toast.success("Ad status updated");
    },
  });

  if (loading || isAdminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Advertiser Management</h1>
            <p className="text-muted-foreground mt-1">Create and manage local advertisers and their ads</p>
          </div>
          
          <Dialog open={isAdvertiserDialogOpen} onOpenChange={setIsAdvertiserDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Advertiser
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Advertiser</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createAdvertiser.mutate(new FormData(e.currentTarget));
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input id="business_name" name="business_name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_email">Business Email *</Label>
                  <Input id="business_email" name="business_email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_phone">Phone</Label>
                  <Input id="business_phone" name="business_phone" type="tel" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_website">Website</Label>
                  <Input id="business_website" name="business_website" type="url" placeholder="https://" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" placeholder="e.g., Dublin, Cork" />
                </div>
                <Button type="submit" className="w-full" disabled={createAdvertiser.isPending}>
                  {createAdvertiser.isPending ? "Creating..." : "Create Advertiser"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Advertisers List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Advertisers</h2>
            {advertisersLoading ? (
              <div className="text-muted-foreground">Loading advertisers...</div>
            ) : advertisers?.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No advertisers yet. Add your first advertiser to get started.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {advertisers?.map((advertiser) => (
                  <Card
                    key={advertiser.id}
                    className={`cursor-pointer transition-all ${
                      selectedAdvertiser?.id === advertiser.id
                        ? "ring-2 ring-primary"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedAdvertiser(advertiser)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{advertiser.business_name}</h3>
                            <div className="text-sm text-muted-foreground space-y-1 mt-1">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {advertiser.business_email}
                              </div>
                              {advertiser.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {advertiser.location}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={advertiser.is_active ? "default" : "secondary"}>
                            {advertiser.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Switch
                            checked={advertiser.is_active}
                            onCheckedChange={(checked) =>
                              toggleAdvertiserStatus.mutate({ id: advertiser.id, is_active: checked })
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Ads for Selected Advertiser */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {selectedAdvertiser ? `Ads for ${selectedAdvertiser.business_name}` : "Select an Advertiser"}
              </h2>
              {selectedAdvertiser && (
                <Dialog open={isAdDialogOpen} onOpenChange={setIsAdDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Ad
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Ad</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        createAd.mutate(new FormData(e.currentTarget));
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="title">Ad Title *</Label>
                        <Input id="title" name="title" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" rows={3} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="image_url">Image URL</Label>
                        <Input id="image_url" name="image_url" type="url" placeholder="https://" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="link_url">Link URL</Label>
                        <Input id="link_url" name="link_url" type="url" placeholder="https://" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="placement">Placement</Label>
                        <Select name="placement" defaultValue="side">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="side">Side (Desktop)</SelectItem>
                            <SelectItem value="inline">Inline (Mobile)</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full" disabled={createAd.isPending}>
                        {createAd.isPending ? "Creating..." : "Create Ad"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {!selectedAdvertiser ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Select an advertiser to view and manage their ads
                </CardContent>
              </Card>
            ) : ads?.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No ads yet for this advertiser
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {ads?.map((ad) => (
                  <Card key={ad.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                            <Megaphone className="h-5 w-5 text-accent-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{ad.title}</h3>
                            {ad.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {ad.description}
                              </p>
                            )}
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{ad.placement}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={ad.is_active ? "default" : "secondary"}>
                            {ad.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Switch
                            checked={ad.is_active ?? false}
                            onCheckedChange={(checked) =>
                              toggleAdStatus.mutate({ id: ad.id, is_active: checked })
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminAdvertisers;
