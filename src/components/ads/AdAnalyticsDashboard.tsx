import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { Eye, MousePointer, TrendingUp, Calendar } from "lucide-react";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";

interface Ad {
  id: string;
  title: string;
  advertiser_id: string;
}

interface Advertiser {
  id: string;
  business_name: string;
}

interface AdAnalyticsDashboardProps {
  advertisers: Advertiser[] | undefined;
}

export function AdAnalyticsDashboard({ advertisers }: AdAnalyticsDashboardProps) {
  const [selectedAdvertiserId, setSelectedAdvertiserId] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("7");

  // Fetch all ads
  const { data: ads } = useQuery({
    queryKey: ["allAds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("id, title, advertiser_id");
      if (error) throw error;
      return data as Ad[];
    },
  });

  // Filter ads by selected advertiser
  const filteredAdIds = useMemo(() => {
    if (!ads) return [];
    if (selectedAdvertiserId === "all") return ads.map(a => a.id);
    return ads.filter(a => a.advertiser_id === selectedAdvertiserId).map(a => a.id);
  }, [ads, selectedAdvertiserId]);

  // Calculate date range
  const dateRangeStart = useMemo(() => {
    return startOfDay(subDays(new Date(), parseInt(dateRange)));
  }, [dateRange]);

  // Fetch impressions
  const { data: impressions } = useQuery({
    queryKey: ["impressionsAnalytics", filteredAdIds, dateRange],
    queryFn: async () => {
      if (filteredAdIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("ad_impressions")
        .select("id, ad_id, created_at")
        .in("ad_id", filteredAdIds)
        .gte("created_at", dateRangeStart.toISOString());
      
      if (error) throw error;
      return data;
    },
    enabled: filteredAdIds.length > 0,
  });

  // Fetch clicks
  const { data: clicks } = useQuery({
    queryKey: ["clicksAnalytics", filteredAdIds, dateRange],
    queryFn: async () => {
      if (filteredAdIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("ad_clicks")
        .select("id, ad_id, created_at")
        .in("ad_id", filteredAdIds)
        .gte("created_at", dateRangeStart.toISOString());
      
      if (error) throw error;
      return data;
    },
    enabled: filteredAdIds.length > 0,
  });

  // Calculate daily stats for chart
  const chartData = useMemo(() => {
    const days = eachDayOfInterval({
      start: dateRangeStart,
      end: new Date(),
    });

    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayImpressions = impressions?.filter(i => 
        format(new Date(i.created_at), "yyyy-MM-dd") === dayStr
      ).length || 0;
      const dayClicks = clicks?.filter(c => 
        format(new Date(c.created_at), "yyyy-MM-dd") === dayStr
      ).length || 0;

      return {
        date: format(day, "MMM d"),
        impressions: dayImpressions,
        clicks: dayClicks,
        ctr: dayImpressions > 0 ? ((dayClicks / dayImpressions) * 100).toFixed(1) : "0",
      };
    });
  }, [impressions, clicks, dateRangeStart]);

  // Calculate ad performance breakdown
  const adPerformance = useMemo(() => {
    if (!ads || !impressions || !clicks) return [];

    const relevantAds = selectedAdvertiserId === "all" 
      ? ads 
      : ads.filter(a => a.advertiser_id === selectedAdvertiserId);

    return relevantAds.map(ad => {
      const adImpressions = impressions.filter(i => i.ad_id === ad.id).length;
      const adClicks = clicks.filter(c => c.ad_id === ad.id).length;
      const ctr = adImpressions > 0 ? ((adClicks / adImpressions) * 100).toFixed(1) : "0";

      return {
        name: ad.title.length > 20 ? ad.title.slice(0, 20) + "..." : ad.title,
        impressions: adImpressions,
        clicks: adClicks,
        ctr: parseFloat(ctr),
      };
    }).sort((a, b) => b.impressions - a.impressions).slice(0, 5);
  }, [ads, impressions, clicks, selectedAdvertiserId]);

  // Summary stats
  const totalImpressions = impressions?.length || 0;
  const totalClicks = clicks?.length || 0;
  const overallCTR = totalImpressions > 0 
    ? ((totalClicks / totalImpressions) * 100).toFixed(2) 
    : "0.00";

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
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

        <Select value={selectedAdvertiserId} onValueChange={setSelectedAdvertiserId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All advertisers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Advertisers</SelectItem>
            {advertisers?.map(adv => (
              <SelectItem key={adv.id} value={adv.id}>
                {adv.business_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Impressions</p>
                <p className="text-2xl font-bold">{totalImpressions.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <MousePointer className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Click-Through Rate</p>
                <p className="text-2xl font-bold">{overallCTR}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Impressions & Clicks Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground"
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="impressions" 
                    stroke="hsl(217, 91%, 60%)" 
                    strokeWidth={2}
                    dot={false}
                    name="Impressions"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="hsl(142, 71%, 45%)" 
                    strokeWidth={2}
                    dot={false}
                    name="Clicks"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Ads */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Performing Ads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {adPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={adPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      type="number"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      className="fill-muted-foreground"
                    />
                    <YAxis 
                      type="category"
                      dataKey="name"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={100}
                      className="fill-muted-foreground"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="impressions" 
                      fill="hsl(217, 91%, 60%)" 
                      radius={[0, 4, 4, 0]}
                      name="Impressions"
                    />
                    <Bar 
                      dataKey="clicks" 
                      fill="hsl(142, 71%, 45%)" 
                      radius={[0, 4, 4, 0]}
                      name="Clicks"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No ad data available for this period
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
