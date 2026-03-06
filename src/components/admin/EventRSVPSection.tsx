import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Loader2, Users, CheckCircle, HelpCircle, XCircle, Send, Calendar, Clock, Mail } from "lucide-react";

interface EventRSVP {
  id: string;
  full_name: string;
  email: string;
  is_registered_user: boolean;
  attendance: string;
  time_preference: string;
  registration_status: string;
  created_at: string;
}

export function EventRSVPSection() {
  const { toast } = useToast();
  const [rsvps, setRsvps] = useState<EventRSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingInvites, setSendingInvites] = useState(false);
  const [sendingConfirmations, setSendingConfirmations] = useState(false);

  useEffect(() => {
    fetchRSVPs();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const sendInvites = async () => {
    setSendingInvites(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-event-invite");
      if (error) throw error;
      toast({ title: "Invites sent! 📧", description: `Successfully sent ${data?.sent || 0} invitation emails.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to send invites", variant: "destructive" });
    } finally {
      setSendingInvites(false);
    }
  };

  const sendConfirmationRequests = async () => {
    setSendingConfirmations(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-event-confirmation-request");
      if (error) throw error;
      toast({ title: "Confirmation requests sent! 📧", description: `Successfully sent ${data?.sent || 0} emails.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to send", variant: "destructive" });
    } finally {
      setSendingConfirmations(false);
    }
  };

  const yesCount = rsvps.filter((r) => r.attendance === "yes").length;
  const maybeCount = rsvps.filter((r) => r.attendance === "maybe").length;
  const noCount = rsvps.filter((r) => r.attendance === "no").length;
  const confirmedCount = rsvps.filter((r) => r.registration_status === "confirmed").length;
  const cancelledCount = rsvps.filter((r) => r.registration_status === "cancelled").length;
  const pendingCount = rsvps.filter((r) => r.registration_status === "interest").length;
  const memberCount = rsvps.filter((r) => r.is_registered_user).length;

  const getAttendanceBadge = (attendance: string) => {
    switch (attendance) {
      case "yes": return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Yes</Badge>;
      case "maybe": return <Badge variant="secondary"><HelpCircle className="h-3 w-3 mr-1" />Maybe</Badge>;
      case "no": return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />No</Badge>;
      default: return <Badge variant="secondary">{attendance}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed": return <Badge className="bg-green-600">Confirmed</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Event RSVPs — Carlow Meet-Up
        </h2>
        <div className="flex gap-2">
          <Button onClick={sendInvites} disabled={sendingInvites} size="sm" variant="outline" className="gap-2">
            {sendingInvites ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sendingInvites ? "Sending..." : "Send Invites"}
          </Button>
          <Button onClick={sendConfirmationRequests} disabled={sendingConfirmations} size="sm" className="gap-2">
            {sendingConfirmations ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            {sendingConfirmations ? "Sending..." : "Confirm Requests"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{rsvps.length}</p>
            <p className="text-xs text-muted-foreground">Total Responses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-5 w-5 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
            <p className="text-xs text-muted-foreground">{pendingCount} Pending · {cancelledCount} Cancelled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <p className="text-sm font-medium mt-1">
              {yesCount} Yes · {maybeCount} Maybe · {noCount} No
            </p>
            <p className="text-xs text-muted-foreground mt-1">Attendance Intent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-orange-500" />
            <p className="text-2xl font-bold">{memberCount}</p>
            <p className="text-xs text-muted-foreground">Existing Members</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All Responses ({rsvps.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {rsvps.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No responses yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableCell>{getStatusBadge(r.registration_status)}</TableCell>
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
    </div>
  );
}