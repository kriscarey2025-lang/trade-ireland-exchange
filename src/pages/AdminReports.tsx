import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Shield, Ban, CheckCircle, XCircle, AlertTriangle, UserX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  admin_notes: string | null;
  resolved_by: string | null;
  reporter?: { full_name: string | null; avatar_url: string | null };
  reported_user?: { full_name: string | null; avatar_url: string | null; email: string | null };
}

interface BannedUser {
  id: string;
  user_id: string;
  banned_by: string;
  reason: string;
  created_at: string;
  user?: { full_name: string | null; avatar_url: string | null; email: string | null };
}

export default function AdminReports() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  // Check admin role
  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      return data === true;
    },
    enabled: !!user,
  });

  // Fetch reports
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profile info for each report
      const reportsWithProfiles = await Promise.all(
        data.map(async (report) => {
          const [reporterRes, reportedRes] = await Promise.all([
            supabase.rpc("get_basic_profile", { _profile_id: report.reporter_id }),
            supabase.from("profiles").select("full_name, avatar_url, email").eq("id", report.reported_user_id).single(),
          ]);
          return {
            ...report,
            reporter: reporterRes.data?.[0] || null,
            reported_user: reportedRes.data || null,
          };
        })
      );

      return reportsWithProfiles as Report[];
    },
    enabled: isAdmin === true,
  });

  // Fetch banned users
  const { data: bannedUsers, isLoading: bannedLoading } = useQuery({
    queryKey: ["banned-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banned_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const usersWithProfiles = await Promise.all(
        data.map(async (ban) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url, email")
            .eq("id", ban.user_id)
            .single();
          return { ...ban, user: profile };
        })
      );

      return usersWithProfiles as BannedUser[];
    },
    enabled: isAdmin === true,
  });

  // Ban user mutation
  const banUser = useMutation({
    mutationFn: async ({ userId, reason, reportId }: { userId: string; reason: string; reportId?: string }) => {
      const { error } = await supabase.from("banned_users").insert({
        user_id: userId,
        banned_by: user!.id,
        reason,
        related_report_id: reportId || null,
      });
      if (error) throw error;

      // Update report status if from a report
      if (reportId) {
        await supabase
          .from("reports")
          .update({
            status: "resolved",
            reviewed_at: new Date().toISOString(),
            admin_notes: adminNotes || "User banned",
            resolved_by: user!.id,
          })
          .eq("id", reportId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      queryClient.invalidateQueries({ queryKey: ["banned-users"] });
      toast({ title: "User banned successfully" });
      setSelectedReport(null);
      setAdminNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to ban user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Unban user mutation
  const unbanUser = useMutation({
    mutationFn: async (banId: string) => {
      const { error } = await supabase.from("banned_users").delete().eq("id", banId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banned-users"] });
      toast({ title: "User unbanned successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to unban user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Dismiss report mutation
  const dismissReport = useMutation({
    mutationFn: async (reportId: string) => {
      const { error } = await supabase
        .from("reports")
        .update({
          status: "dismissed",
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes || "Report dismissed",
          resolved_by: user!.id,
        })
        .eq("id", reportId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      toast({ title: "Report dismissed" });
      setSelectedReport(null);
      setAdminNotes("");
    },
  });

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "resolved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Resolved</Badge>;
      case "dismissed":
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">Dismissed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      harassment: "Harassment or bullying",
      spam: "Spam or scam",
      inappropriate: "Inappropriate content",
      fraud: "Fraudulent activity",
      other: "Other violation",
    };
    return labels[reason] || reason;
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
              <p className="text-muted-foreground mb-4">
                You don't have permission to access this page.
              </p>
              <Button onClick={() => navigate("/")}>Back to Home</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const pendingReports = reports?.filter((r) => r.status === "pending") || [];
  const resolvedReports = reports?.filter((r) => r.status !== "pending") || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/20">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Reports & Moderation</h1>
          </div>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Pending ({pendingReports.length})
              </TabsTrigger>
              <TabsTrigger value="resolved" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Resolved ({resolvedReports.length})
              </TabsTrigger>
              <TabsTrigger value="banned" className="gap-2">
                <UserX className="h-4 w-4" />
                Banned Users ({bannedUsers?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {reportsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : pendingReports.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No pending reports. All clear!</p>
                  </CardContent>
                </Card>
              ) : (
                pendingReports.map((report) => (
                  <Card key={report.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(report.status)}
                            <Badge variant="outline">{getReasonLabel(report.reason)}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(report.created_at), "dd MMM yyyy, HH:mm")}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Reported by</p>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={report.reporter?.avatar_url || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {getInitials(report.reporter?.full_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{report.reporter?.full_name || "Unknown"}</span>
                              </div>
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Reported user</p>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={report.reported_user?.avatar_url || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {getInitials(report.reported_user?.full_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <span className="text-sm">{report.reported_user?.full_name || "Unknown"}</span>
                                  {report.reported_user?.email && (
                                    <p className="text-xs text-muted-foreground">{report.reported_user.email}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {report.description && (
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-sm">{report.description}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="gap-1"
                                onClick={() => setSelectedReport(report)}
                              >
                                <Ban className="h-4 w-4" />
                                Ban User
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Ban {report.reported_user?.full_name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will prevent the user from accessing the platform. This action can be reversed.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="space-y-2">
                                <Textarea
                                  placeholder="Admin notes (optional)"
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setAdminNotes("")}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    banUser.mutate({
                                      userId: report.reported_user_id,
                                      reason: report.reason + (report.description ? `: ${report.description}` : ""),
                                      reportId: report.id,
                                    })
                                  }
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {banUser.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Ban"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => dismissReport.mutate(report.id)}
                            disabled={dismissReport.isPending}
                          >
                            <XCircle className="h-4 w-4" />
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4">
              {resolvedReports.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <p>No resolved reports yet.</p>
                  </CardContent>
                </Card>
              ) : (
                resolvedReports.map((report) => (
                  <Card key={report.id} className="opacity-75">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(report.status)}
                            <Badge variant="outline">{getReasonLabel(report.reason)}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(report.created_at), "dd MMM yyyy")}
                            </span>
                          </div>
                          <p className="text-sm">
                            <span className="font-medium">{report.reported_user?.full_name || "Unknown"}</span>
                            {" reported by "}
                            <span className="font-medium">{report.reporter?.full_name || "Unknown"}</span>
                          </p>
                          {report.admin_notes && (
                            <p className="text-sm text-muted-foreground">Notes: {report.admin_notes}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="banned" className="space-y-4">
              {bannedLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : bannedUsers?.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <p>No banned users.</p>
                  </CardContent>
                </Card>
              ) : (
                bannedUsers?.map((ban) => (
                  <Card key={ban.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={ban.user?.avatar_url || undefined} />
                            <AvatarFallback>{getInitials(ban.user?.full_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{ban.user?.full_name || "Unknown"}</p>
                            <p className="text-sm text-muted-foreground">{ban.user?.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Banned on {format(new Date(ban.created_at), "dd MMM yyyy")}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-muted-foreground mb-2">{ban.reason}</p>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Unban
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Unban {ban.user?.full_name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will restore the user's access to the platform.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => unbanUser.mutate(ban.id)}>
                                  Confirm Unban
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
