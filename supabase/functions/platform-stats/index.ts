import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total users
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Daily active users (users with engagement today)
    const { count: dailyActiveUsers } = await supabase
      .from("user_engagement")
      .select("user_id", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    // Weekly active users
    const { data: weeklyData } = await supabase
      .from("user_engagement")
      .select("user_id")
      .gte("created_at", weekAgo.toISOString());
    const weeklyActiveUsers = new Set(weeklyData?.map(d => d.user_id) || []).size;

    // Monthly active users
    const { data: monthlyData } = await supabase
      .from("user_engagement")
      .select("user_id")
      .gte("created_at", monthAgo.toISOString());
    const monthlyActiveUsers = new Set(monthlyData?.map(d => d.user_id) || []).size;

    // Messages today
    const { count: messagesToday } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    // Messages this week
    const { count: messagesThisWeek } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString());

    // New services today
    const { count: newServicesToday } = await supabase
      .from("services")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    // New services this week
    const { count: newServicesThisWeek } = await supabase
      .from("services")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString());

    // Active services
    const { count: activeServices } = await supabase
      .from("services")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .eq("moderation_status", "approved");

    // Swaps in progress (accepted but not completed)
    const { count: swapsInProgress } = await supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .eq("swap_status", "accepted");

    // Completed swaps
    const { count: completedSwapsTotal } = await supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .in("swap_status", ["completed", "closed"]);

    // Pending verifications
    const { count: pendingVerifications } = await supabase
      .from("verification_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    // Pending reports
    const { count: pendingReports } = await supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    // Recent signups (last 7 days)
    const recentSignups: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", dayStart.toISOString())
        .lt("created_at", dayEnd.toISOString());
      
      recentSignups.push({
        date: dayStart.toISOString().split("T")[0],
        count: count || 0,
      });
    }

    // Recent messages (last 7 days)
    const recentMessages: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .gte("created_at", dayStart.toISOString())
        .lt("created_at", dayEnd.toISOString());
      
      recentMessages.push({
        date: dayStart.toISOString().split("T")[0],
        count: count || 0,
      });
    }

    // Top categories
    const { data: categoryData } = await supabase
      .from("services")
      .select("category")
      .eq("status", "active");
    
    const categoryCounts: Record<string, number> = {};
    categoryData?.forEach(s => {
      categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
    });
    
    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const stats: PlatformStats = {
      dailyActiveUsers: dailyActiveUsers || 0,
      weeklyActiveUsers,
      monthlyActiveUsers,
      totalUsers: totalUsers || 0,
      messagesToday: messagesToday || 0,
      messagesThisWeek: messagesThisWeek || 0,
      newServicesToday: newServicesToday || 0,
      newServicesThisWeek: newServicesThisWeek || 0,
      activeServices: activeServices || 0,
      swapsInProgress: swapsInProgress || 0,
      completedSwapsTotal: completedSwapsTotal || 0,
      pendingVerifications: pendingVerifications || 0,
      pendingReports: pendingReports || 0,
      recentSignups,
      recentMessages,
      topCategories,
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("platform-stats error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
