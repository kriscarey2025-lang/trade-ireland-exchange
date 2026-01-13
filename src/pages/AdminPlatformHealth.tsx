import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  MessageSquare, 
  Briefcase, 
  RefreshCw, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  Calendar,
  BarChart3,
  ArrowRightLeft
} from "lucide-react";
import { toast } from "sonner";

interface PlatformStats {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  totalUsers: number;
  messagesToday: number;
  messagesThisWeek: number;
  newServicesToday: number;
  newServicesThisWeek: number;
  activeServices: number;
  swapsInProgress: number;
  completedSwapsTotal: number;
  pendingVerifications: number;
  pendingReports: number;
  recentSignups: { date: string; count: number }[];
  recentMessages: { date: string; count: number }[];
  topCategories: { category: string; count: number }[];
}

export default function AdminPlatformHealth() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }

    const checkAdmin = async () => {
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (!data) {
        navigate("/");
        toast.error("Admin access required");
      } else {
        setIsAdmin(true);
        fetchStats();
      }
    };

    checkAdmin();
  }, [user, authLoading, navigate]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("platform-stats");
      
      if (error) throw error;
      
      setStats(data as PlatformStats);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Failed to fetch stats:", err);
      toast.error("Failed to load platform stats");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IE", { weekday: "short", day: "numeric" });
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary/20">
      <Header />
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Platform Health
            </h1>
            {lastUpdated && (
              <p className="text-sm text-muted-foreground mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <Button onClick={fetchStats} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {loading && !stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Daily Active
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.dailyActiveUsers}</div>
                  <p className="text-xs text-muted-foreground">users today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Weekly Active
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.weeklyActiveUsers}</div>
                  <p className="text-xs text-muted-foreground">of {stats.totalUsers} total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Messages Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.messagesToday}</div>
                  <p className="text-xs text-muted-foreground">{stats.messagesThisWeek} this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Active Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeServices}</div>
                  <p className="text-xs text-muted-foreground">+{stats.newServicesThisWeek} this week</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center gap-2">
                    <ArrowRightLeft className="h-4 w-4" />
                    Swaps in Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {stats.swapsInProgress}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Completed Swaps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {stats.completedSwapsTotal}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Monthly Active
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.monthlyActiveUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalUsers > 0 ? Math.round((stats.monthlyActiveUsers / stats.totalUsers) * 100) : 0}% of users
                  </p>
                </CardContent>
              </Card>

              <Card className={stats.pendingVerifications > 0 ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Pending Verifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
                  {stats.pendingVerifications > 0 && (
                    <Button 
                      size="sm" 
                      variant="link" 
                      className="p-0 h-auto text-xs"
                      onClick={() => navigate("/admin/verification")}
                    >
                      Review now →
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card className={stats.pendingReports > 0 ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Pending Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingReports}</div>
                  {stats.pendingReports > 0 && (
                    <Button 
                      size="sm" 
                      variant="link" 
                      className="p-0 h-auto text-xs"
                      onClick={() => navigate("/admin/reports")}
                    >
                      Review now →
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Recent Signups Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    New Signups (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 h-32">
                    {stats.recentSignups.map((day, i) => {
                      const maxCount = Math.max(...stats.recentSignups.map(d => d.count), 1);
                      const height = (day.count / maxCount) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs font-medium">{day.count}</span>
                          <div 
                            className="w-full bg-primary/80 rounded-t transition-all"
                            style={{ height: `${Math.max(height, 4)}%` }}
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(day.date)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Messages Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Messages (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 h-32">
                    {stats.recentMessages.map((day, i) => {
                      const maxCount = Math.max(...stats.recentMessages.map(d => d.count), 1);
                      const height = (day.count / maxCount) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs font-medium">{day.count}</span>
                          <div 
                            className="w-full bg-accent/80 rounded-t transition-all"
                            style={{ height: `${Math.max(height, 4)}%` }}
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(day.date)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top Service Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {stats.topCategories.map((cat, i) => (
                    <Badge key={cat.category} variant={i === 0 ? "default" : "secondary"}>
                      {cat.category}: {cat.count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Failed to load stats. Please try again.</p>
            <Button onClick={fetchStats} className="mt-4">
              Retry
            </Button>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
