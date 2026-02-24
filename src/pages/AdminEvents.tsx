import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, Users, CheckCircle, HelpCircle, XCircle, Send, Calendar, Sun, Clock } from "lucide-react";

interface EventRSVP {
  id: string;
  full_name: string;
  email: string;
  is_registered_user: boolean;
  attendance: string;
  time_preference: string;
  created_at: string;
}

const AdminEvents = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [rsvps, setRsvps] = useState<EventRSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingInvites, setSendingInvites] = useState(false);

  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      return data === true;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!authLoading && (!user || isAdmin === false)) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchRSVPs();
  }, [isAdmin]);

  const fetchRSVPs = async () => {
    try {
      const { data, error } = await supabase
        .from("event_rsvps" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRsvps((data as any as EventRSVP[]) || []);
    } catch (error) {
      console.error("Error fetching RSVPs:", error);
      toast({ title: "Error", description: "Failed to load RSVPs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const sendInvites = async () => {
    setSendingInvites(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-event-invite");
      if (error) throw error;
      toast({
        title: "Invites sent! 📧",
        description: `Successfully sent ${data?.sent || 0} invitation emails.`,
      });
    } catch (error: any) {
      console.error("Error sending invites:", error);
      toast({ title: "Error", description: error.message || "Failed to send invites", variant: "destructive" });
    } finally {
      setSendingInvites(false);
    }
  };

  const yesCount = rsvps.filter((r) => r.attendance === "yes").length;
  const maybeCount = rsvps.filter((r) => r.attendance === "maybe").length;
  const noCount = rsvps.filter((r) => r.attendance === "no").length;
  const daytimeCount = rsvps.filter((r) => r.time_preference === "daytime").length;
  const weekendCount = rsvps.filter((r) => r.time_preference === "weekend").length;
  const eitherCount = rsvps.filter((r) => r.time_preference === "either").length;
  const memberCount = rsvps.filter((r) => r.is_registered_user).length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const getAttendanceBadge = (attendance: string) => {
    switch (attendance) {
      case "yes":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Yes</Badge>;
      case "maybe":
        return <Badge variant="secondary"><HelpCircle className="h-3 w-3 mr-1" />Maybe</Badge>;
      case "no":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />No</Badge>;
      default:
        return <Badge variant="secondary">{attendance}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Event RSVPs — Carlow Meet-Up</h1>
            <p className="text-muted-foreground">Manage responses for the in-person swap event</p>
          </div>
          <Button onClick={sendInvites} disabled={sendingInvites} className="gap-2">
            {sendingInvites ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sendingInvites ? "Sending..." : "Send Invites"}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold">{rsvps.length}</p>
              <p className="text-sm text-muted-foreground">Total Responses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-3xl font-bold text-green-600">{yesCount}</p>
              <p className="text-sm text-muted-foreground">Yes / {maybeCount} Maybe / {noCount} No</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="text-sm font-medium mt-1">
                <Sun className="inline h-3 w-3 mr-1" />{daytimeCount} Day · {weekendCount} Wknd · {eitherCount} Either
              </p>
              <p className="text-sm text-muted-foreground mt-1">Time Preference</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <p className="text-3xl font-bold">{memberCount}</p>
              <p className="text-sm text-muted-foreground">Existing Members</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Responses ({rsvps.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {rsvps.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No responses yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Time Pref</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rsvps.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.full_name}</TableCell>
                      <TableCell className="text-sm">{r.email}</TableCell>
                      <TableCell>{r.is_registered_user ? "✅" : "—"}</TableCell>
                      <TableCell>{getAttendanceBadge(r.attendance)}</TableCell>
                      <TableCell className="text-sm capitalize">{r.time_preference}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(r.created_at), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminEvents;
