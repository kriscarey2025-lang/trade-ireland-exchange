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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Building2, Megaphone, Eye, MousePointer, CalendarIcon, BarChart3, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdImageUpload } from "@/components/ads/AdImageUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Advertiser {
  id: string;
  business_name: string;
  business_email: string;
  is_active: boolean;
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

const AD_TITLE_LIMIT = 60;
const AD_DESCRIPTION_LIMIT = 150;

const AdvertiserDashboard = () => {
  const [adImageUrl, setAdImageUrl] = useState("");
  const [adTitle, setAdTitle] = useState("");
  const [adDescription, setAdDescription] = useState("");
  const [adStartDate, setAdStartDate] = useState<Date | undefined>(undefined);
  const [adEndDate, setAdEndDate] = useState<Date | undefined>(undefined);
  const [isAdDialogOpen, setIsAdDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState("30");
  
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  // Check if user is an advertiser
  const { data: advertiser, isLoading: advertiserLoading } = useQuery({
    queryKey: ["myAdvertiser", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("advertisers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Advertiser | null;
    },
    enabled: !!user?.id,
  });

  // Fetch ads for this advertiser
  const { data: ads, isLoading: adsLoading } = useQuery({
    queryKey: ["myAds", advertiser?.id],
    queryFn: async () => {
      if (!advertiser) return [];
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("advertiser_id", advertiser.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Ad[];
    },
    enabled: !!advertiser,
  });

  // Fetch analytics data
  const dateRangeStart = startOfDay(subDays(new Date(), parseInt(dateRange)));
  
  const { data: impressions } = useQuery({
    queryKey: ["myImpressions", advertiser?.id, dateRange],
    queryFn: async () => {
      if (!advertiser) return [];
      const { data, error } = await supabase
        .from("ad_impressions")
        .select("ad_id, created_at")
        .gte("created_at", dateRangeStart.toISOString());
      
      if (error) throw error;
      return data;
    },
    enabled: !!advertiser,
  });

  const { data: clicks } = useQuery({
    queryKey: ["myClicks", advertiser?.id, dateRange],
    queryFn: async () => {
      if (!advertiser) return [];
      const { data, error } = await supabase
        .from("ad_clicks")
        .select("ad_id, created_at")
        .gte("created_at", dateRangeStart.toISOString());
      
      if (error) throw error;
      return data;
    },
    enabled: !!advertiser,
  });

  // Filter data to only this advertiser's ads
  const myAdIds = ads?.map(a => a.id) || [];
  const myImpressions = impressions?.filter(i => myAdIds.includes(i.ad_id)) || [];
  const myClicks = clicks?.filter(c => myAdIds.includes(c.ad_id)) || [];

  // Calculate totals
  const totalImpressions = myImpressions.length;
  const totalClicks = myClicks.length;
  const overallCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

  // Prepare chart data
  const chartData = (() => {
    const days = parseInt(dateRange);
    const data: { date: string; impressions: number; clicks: number }[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");
      const displayDate = format(date, "MMM d");
      
      const dayImpressions = myImpressions.filter(
        imp => format(new Date(imp.created_at), "yyyy-MM-dd") === dateStr
      ).length;
      
      const dayClicks = myClicks.filter(
        click => format(new Date(click.created_at), "yyyy-MM-dd") === dateStr
      ).length;
      
      data.push({ date: displayDate, impressions: dayImpressions, clicks: dayClicks });
    }
    
    return data;
  })();

  // Create ad mutation
  const createAd = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!advertiser) throw new Error("No advertiser account found");
      
      const { error } = await supabase.from("ads").insert({
        advertiser_id: advertiser.id,
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
      queryClient.invalidateQueries({ queryKey: ["myAds", advertiser?.id] });
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

  // Toggle ad status
  const toggleAdStatus = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("ads")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myAds", advertiser?.id] });
      toast.success("Ad status updated");
    },
  });

  if (loading || advertiserLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!advertiser) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle>No Advertiser Account</CardTitle>
              <CardDescription>
                You don't have an advertiser account linked to your profile. 
                Please contact an administrator to set up your advertiser account.
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!advertiser.is_active) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle>Account Inactive</CardTitle>
              <CardDescription>
                Your advertiser account is currently inactive. 
                Please contact an administrator to reactivate your account.
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{advertiser.business_name}</h1>
            <p className="text-muted-foreground mt-1">Manage your ads and view performance</p>
          </div>
          <Badge variant="default">Active</Badge>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="ads" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              My Ads
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Date Range Selector */}
            <div className="flex justify-end">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Impressions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{totalImpressions.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Clicks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <MousePointer className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{totalClicks.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Click-Through Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{overallCTR}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis 
                        dataKey="date" 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="impressions" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="clicks" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ads" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={isAdDialogOpen} onOpenChange={setIsAdDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Ad
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
            </div>

            {adsLoading ? (
              <div className="text-muted-foreground text-center py-8">Loading ads...</div>
            ) : ads?.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No ads yet</h3>
                  <p className="text-muted-foreground">Create your first ad to start reaching customers</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {ads?.map((ad) => {
                  const adImpressions = myImpressions.filter(i => i.ad_id === ad.id).length;
                  const adClicks = myClicks.filter(c => c.ad_id === ad.id).length;
                  const ctr = adImpressions > 0 ? ((adClicks / adImpressions) * 100).toFixed(1) : "0.0";
                  
                  return (
                    <Card key={ad.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            {ad.image_url ? (
                              <img 
                                src={ad.image_url} 
                                alt={ad.title}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                                <Megaphone className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1">
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
                              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  <span>{adImpressions.toLocaleString()} views</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MousePointer className="h-4 w-4" />
                                  <span>{adClicks.toLocaleString()} clicks</span>
                                </div>
                                <div className="text-primary font-medium">
                                  {ctr}% CTR
                                </div>
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
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdvertiserDashboard;
