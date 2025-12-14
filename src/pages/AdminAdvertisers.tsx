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
import { Plus, Building2, Mail, Phone, Globe, MapPin, Megaphone, Eye, MousePointer, BarChart3, CalendarIcon, CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdImageUpload } from "@/components/ads/AdImageUpload";
import { AdAnalyticsDashboard } from "@/components/ads/AdAnalyticsDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Advertiser {
  id: string;
  business_name: string;
  business_email: string;
  business_phone: string | null;
  business_website: string | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
  user_id: string | null;
}

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
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
  approved: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

interface AdvertiserInterest {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  location: string;
  website: string | null;
  message: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

interface AdStats {
  ad_id: string;
  impressions: number;
  clicks: number;
}

const AD_TITLE_LIMIT = 60;
const AD_DESCRIPTION_LIMIT = 150;

const AdminAdvertisers = () => {
  const [adImageUrl, setAdImageUrl] = useState("");
  const [adTitle, setAdTitle] = useState("");
  const [adDescription, setAdDescription] = useState("");
  const [adStartDate, setAdStartDate] = useState<Date | undefined>(undefined);
  const [adEndDate, setAdEndDate] = useState<Date | undefined>(undefined);
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [isAdvertiserDialogOpen, setIsAdvertiserDialogOpen] = useState(false);
  const [isAdDialogOpen, setIsAdDialogOpen] = useState(false);
  const [selectedAdvertiser, setSelectedAdvertiser] = useState<Advertiser | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

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

  // Fetch advertiser interest submissions
  const { data: advertiserInterests, isLoading: interestsLoading } = useQuery({
    queryKey: ["advertiserInterests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advertiser_interests")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as AdvertiserInterest[];
    },
    enabled: isAdmin === true,
  });

  // Fetch ad stats (impressions and clicks)
  const { data: adStats } = useQuery({
    queryKey: ["adStats", ads?.map(a => a.id)],
    queryFn: async () => {
      if (!ads || ads.length === 0) return [];
      
      const adIds = ads.map(a => a.id);
      
      // Get impressions count per ad
      const { data: impressionsData, error: impError } = await supabase
        .from("ad_impressions")
        .select("ad_id")
        .in("ad_id", adIds);
      
      if (impError) throw impError;
      
      // Get clicks count per ad
      const { data: clicksData, error: clickError } = await supabase
        .from("ad_clicks")
        .select("ad_id")
        .in("ad_id", adIds);
      
      if (clickError) throw clickError;
      
      // Aggregate counts
      const stats: AdStats[] = adIds.map(adId => ({
        ad_id: adId,
        impressions: impressionsData?.filter(i => i.ad_id === adId).length || 0,
        clicks: clicksData?.filter(c => c.ad_id === adId).length || 0,
      }));
      
      return stats;
    },
    enabled: !!ads && ads.length > 0,
  });

  // Create advertiser mutation
  const createAdvertiser = useMutation({
    mutationFn: async (formData: FormData) => {
      const email = userEmail.trim();
      const businessName = formData.get("business_name") as string;
      const businessEmail = formData.get("business_email") as string;
      const businessPhone = formData.get("business_phone") as string || null;
      const businessWebsite = formData.get("business_website") as string || null;
      const location = formData.get("location") as string || null;

      if (email) {
        // Use the RPC function to create advertiser linked to user by email
        const { data, error } = await supabase.rpc("create_advertiser_by_email", {
          _email: email,
          _business_name: businessName,
          _business_email: businessEmail,
          _business_phone: businessPhone,
          _business_website: businessWebsite,
          _location: location,
        });
        if (error) throw error;
        return data;
      } else {
        // Create advertiser without user link
        const { error } = await supabase.from("advertisers").insert({
          business_name: businessName,
          business_email: businessEmail,
          business_phone: businessPhone,
          business_website: businessWebsite,
          location: location,
          user_id: null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertisers"] });
      setIsAdvertiserDialogOpen(false);
      setUserEmail("");
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
        title: adTitle,
        description: adDescription || null,
        image_url: adImageUrl || null,
        link_url: formData.get("link_url") as string || null,
        placement: formData.get("placement") as string || "side",
        starts_at: adStartDate?.toISOString() || null,
        ends_at: adEndDate?.toISOString() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads", selectedAdvertiser?.id] });
      setIsAdDialogOpen(false);
      setAdImageUrl("");
      setAdTitle("");
      setAdDescription("");
      setAdStartDate(undefined);
      setAdEndDate(undefined);
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

  // Toggle ad approval status
  const toggleAdApproval = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase
        .from("ads")
        .update({ approved })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads", selectedAdvertiser?.id] });
      toast.success(toggleAdApproval.variables?.approved ? "Ad approved" : "Ad approval revoked");
    },
  });

  // Update advertiser interest status
  const updateInterestStatus = useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: string; admin_notes?: string }) => {
      const { error } = await supabase
        .from("advertiser_interests")
        .update({ 
          status, 
          admin_notes: admin_notes || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id 
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertiserInterests"] });
      toast.success("Interest status updated");
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Advertiser Management</h1>
            <p className="text-muted-foreground mt-1">Create and manage local advertisers and their ads</p>
          </div>
        </div>

        <Tabs defaultValue="manage" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Requests
              {advertiserInterests?.filter(i => i.status === 'pending').length ? (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {advertiserInterests.filter(i => i.status === 'pending').length}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Manage
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Advertiser Interest Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {interestsLoading ? (
                  <div className="text-muted-foreground">Loading requests...</div>
                ) : advertiserInterests?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No advertiser interest requests yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {advertiserInterests?.map((interest) => (
                      <Card key={interest.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{interest.business_name}</h3>
                                <Badge 
                                  variant={
                                    interest.status === 'pending' ? 'secondary' : 
                                    interest.status === 'approved' ? 'default' : 'destructive'
                                  }
                                >
                                  {interest.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                  {interest.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                                  {interest.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                                  {interest.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Contact:</span> {interest.contact_name}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3" /> {interest.email}
                                </div>
                                {interest.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-3 w-3" /> {interest.phone}
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3 w-3" /> {interest.location}
                                </div>
                                {interest.website && (
                                  <div className="flex items-center gap-2">
                                    <Globe className="h-3 w-3" /> 
                                    <a href={interest.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                      {interest.website}
                                    </a>
                                  </div>
                                )}
                                {interest.message && (
                                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                                    {interest.message}
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground mt-2">
                                  Submitted: {new Date(interest.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            {interest.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => updateInterestStatus.mutate({ id: interest.id, status: 'approved' })}
                                  disabled={updateInterestStatus.isPending}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateInterestStatus.mutate({ id: interest.id, status: 'rejected' })}
                                  disabled={updateInterestStatus.isPending}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <AdAnalyticsDashboard advertisers={advertisers} />
          </TabsContent>

          <TabsContent value="manage">
            <div className="flex justify-end mb-6">
          
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
                <div className="space-y-2">
                  <Label htmlFor="user_email">Link to User by Email (Optional)</Label>
                  <Input
                    id="user_email"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the email of an existing user to give them advertiser dashboard access
                  </p>
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
                        <div className="flex items-center justify-between">
                          <Label htmlFor="title">Ad Title *</Label>
                          <span className={`text-xs ${adTitle.length > AD_TITLE_LIMIT ? "text-destructive" : "text-muted-foreground"}`}>
                            {adTitle.length}/{AD_TITLE_LIMIT}
                          </span>
                        </div>
                        <Input 
                          id="title" 
                          name="title" 
                          value={adTitle}
                          onChange={(e) => setAdTitle(e.target.value.slice(0, AD_TITLE_LIMIT))}
                          maxLength={AD_TITLE_LIMIT}
                          placeholder="Short, catchy headline"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="description">Description</Label>
                          <span className={`text-xs ${adDescription.length > AD_DESCRIPTION_LIMIT ? "text-destructive" : "text-muted-foreground"}`}>
                            {adDescription.length}/{AD_DESCRIPTION_LIMIT}
                          </span>
                        </div>
                        <Textarea 
                          id="description" 
                          name="description" 
                          value={adDescription}
                          onChange={(e) => setAdDescription(e.target.value.slice(0, AD_DESCRIPTION_LIMIT))}
                          maxLength={AD_DESCRIPTION_LIMIT}
                          placeholder="Brief description of your offer"
                          rows={3} 
                        />
                      </div>
                      <AdImageUpload 
                        value={adImageUrl} 
                        onChange={setAdImageUrl} 
                      />
                      <div className="space-y-2">
                        <Label htmlFor="link_url">Link URL</Label>
                        <Input id="link_url" name="link_url" type="url" placeholder="https://your-website.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="placement">Placement</Label>
                        <Select name="placement" defaultValue="both">
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

                      {/* Scheduling Section */}
                      <div className="space-y-3 pt-2 border-t border-border">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          Campaign Schedule
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Start Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !adStartDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {adStartDate ? format(adStartDate, "MMM d, yyyy") : "Now"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={adStartDate}
                                  onSelect={setAdStartDate}
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">End Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !adEndDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {adEndDate ? format(adEndDate, "MMM d, yyyy") : "No end"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={adEndDate}
                                  onSelect={setAdEndDate}
                                  disabled={(date) => adStartDate ? date < adStartDate : false}
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Leave dates empty to run indefinitely starting now
                        </p>
                      </div>
                      <Button type="submit" className="w-full" disabled={createAd.isPending || !adTitle.trim()}>
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
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline">{ad.placement}</Badge>
                              {ad.starts_at && (
                                <Badge variant="outline" className="text-xs">
                                  <CalendarIcon className="h-3 w-3 mr-1" />
                                  {format(new Date(ad.starts_at), "MMM d")}
                                  {ad.ends_at ? ` - ${format(new Date(ad.ends_at), "MMM d")}` : "+"}
                                </Badge>
                              )}
                              {ad.ends_at && new Date(ad.ends_at) < new Date() && (
                                <Badge variant="secondary" className="text-xs">Ended</Badge>
                              )}
                              {ad.starts_at && new Date(ad.starts_at) > new Date() && (
                                <Badge variant="secondary" className="text-xs">Scheduled</Badge>
                              )}
                            </div>
                            {/* Ad Stats */}
                            {(() => {
                              const stats = adStats?.find(s => s.ad_id === ad.id);
                              const ctr = stats && stats.impressions > 0 
                                ? ((stats.clicks / stats.impressions) * 100).toFixed(1) 
                                : "0.0";
                              return (
                                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    <span>{stats?.impressions || 0} views</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MousePointer className="h-3 w-3" />
                                    <span>{stats?.clicks || 0} clicks</span>
                                  </div>
                                  <div className="text-primary font-medium">
                                    {ctr}% CTR
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={ad.approved ? "default" : "secondary"}>
                              {ad.approved ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approved
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </>
                              )}
                            </Badge>
                            <Button
                              size="sm"
                              variant={ad.approved ? "outline" : "default"}
                              onClick={() => toggleAdApproval.mutate({ id: ad.id, approved: !ad.approved })}
                              disabled={toggleAdApproval.isPending}
                            >
                              {ad.approved ? "Revoke" : "Approve"}
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Active:</span>
                            <Switch
                              checked={ad.is_active ?? false}
                              onCheckedChange={(checked) =>
                                toggleAdStatus.mutate({ id: ad.id, is_active: checked })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminAdvertisers;
