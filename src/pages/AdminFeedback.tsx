import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb, MessageSquare, Clock, CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface Feedback {
  id: string;
  type: "feature_request" | "feedback" | "contact";
  subject: string;
  message: string;
  email: string | null;
  user_id: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const AdminFeedback = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchFeedback();
    }
  }, [isAdmin]);

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from("user_feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFeedbackList((data as Feedback[]) || []);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast({
        title: "Error",
        description: "Failed to load feedback",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string, notes?: string) => {
    setUpdatingId(id);
    try {
      const updateData: { status: string; admin_notes?: string } = { status };
      if (notes !== undefined) {
        updateData.admin_notes = notes;
      }

      const { error } = await supabase
        .from("user_feedback")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      setFeedbackList((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status, ...(notes !== undefined && { admin_notes: notes }) } : item
        )
      );

      toast({
        title: "Status updated",
        description: "Feedback status has been updated.",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "reviewed":
        return <Badge variant="outline" className="border-blue-500 text-blue-500"><CheckCircle className="h-3 w-3 mr-1" />Reviewed</Badge>;
      case "implemented":
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Implemented</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const featureRequests = feedbackList.filter((f) => f.type === "feature_request");
  const feedback = feedbackList.filter((f) => f.type === "feedback");
  const contactMessages = feedbackList.filter((f) => f.type === "contact");

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const FeedbackCard = ({ item }: { item: Feedback }) => (
    <Card key={item.id}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {item.type === "feature_request" ? (
              <Lightbulb className="h-4 w-4 text-primary" />
            ) : item.type === "contact" ? (
              <Mail className="h-4 w-4 text-blue-500" />
            ) : (
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            )}
            <CardTitle className="text-base">{item.subject}</CardTitle>
          </div>
          {getStatusBadge(item.status)}
        </div>
        <p className="text-xs text-muted-foreground">
          {format(new Date(item.created_at), "MMM d, yyyy 'at' h:mm a")}
          {item.email && ` • ${item.email}`}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground whitespace-pre-wrap">{item.message}</p>

        <div className="flex items-center gap-2">
          <Select
            value={item.status}
            onValueChange={(value) => updateStatus(item.id, value)}
            disabled={updatingId === item.id}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="implemented">Implemented</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          {updatingId === item.id && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>

        <div>
          <Textarea
            placeholder="Add admin notes..."
            defaultValue={item.admin_notes || ""}
            onBlur={(e) => {
              if (e.target.value !== item.admin_notes) {
                updateStatus(item.id, item.status, e.target.value);
              }
            }}
            className="text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Messages & Feedback</h1>
          <p className="text-muted-foreground">
            Manage contact form messages, feature requests, and user feedback
          </p>
        </div>

        <Tabs defaultValue="contact" className="space-y-6">
          <TabsList>
            <TabsTrigger value="contact" className="gap-2">
              <Mail className="h-4 w-4" />
              Contact Messages ({contactMessages.length})
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Feature Requests ({featureRequests.length})
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Feedback ({feedback.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contact" className="space-y-4">
            {contactMessages.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No contact messages yet
                </CardContent>
              </Card>
            ) : (
              contactMessages.map((item) => <FeedbackCard key={item.id} item={item} />)
            )}
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            {featureRequests.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No feature requests yet
                </CardContent>
              </Card>
            ) : (
              featureRequests.map((item) => <FeedbackCard key={item.id} item={item} />)
            )}
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            {feedback.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No feedback yet
                </CardContent>
              </Card>
            ) : (
              feedback.map((item) => <FeedbackCard key={item.id} item={item} />)
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminFeedback;
