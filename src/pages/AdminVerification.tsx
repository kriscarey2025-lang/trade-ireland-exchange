import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Loader2, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye,
  AlertTriangle,
  FileImage
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface VerificationRequest {
  id: string;
  user_id: string;
  document_url: string;
  document_type: string;
  status: string;
  admin_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  user_name: string | null;
  user_email: string | null;
  user_avatar: string | null;
}

export default function AdminVerification() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);

  // Check admin access
  useEffect(() => {
    async function checkAdminAccess() {
      if (!user) return;
      
      const { data, error } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });
      
      if (error) {
        console.error("Error checking admin access:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data === true);
      }
    }
    
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Redirect if not admin
  useEffect(() => {
    if (isAdmin === false) {
      toast.error("Access denied: Admin privileges required");
      navigate('/');
    }
  }, [isAdmin, navigate]);

  // Fetch verification requests
  useEffect(() => {
    async function fetchRequests() {
      if (!isAdmin) return;
      
      const { data, error } = await supabase.rpc('get_pending_verifications');
      
      if (error) {
        console.error("Error fetching verifications:", error);
        toast.error("Failed to load verification requests");
      } else {
        setRequests(data || []);
      }
      
      setLoading(false);
    }
    
    if (isAdmin) {
      fetchRequests();
    }
  }, [isAdmin]);

  const viewDocument = async (request: VerificationRequest) => {
    setSelectedRequest(request);
    setLoadingDocument(true);
    setDocumentUrl(null);

    try {
      // Get the document path from the function
      const { data: docPath, error: pathError } = await supabase
        .rpc('get_verification_document_url', { _request_id: request.id });
      
      if (pathError) throw pathError;

      // Create a signed URL for the document
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('id-documents')
        .createSignedUrl(docPath, 300); // 5 minute expiry

      if (urlError) throw urlError;

      setDocumentUrl(signedUrlData.signedUrl);
    } catch (error: any) {
      console.error("Error loading document:", error);
      toast.error("Failed to load document");
    } finally {
      setLoadingDocument(false);
    }
  };

  const openReviewDialog = (action: "approve" | "reject") => {
    setReviewAction(action);
    setReviewNotes("");
    setShowReviewDialog(true);
  };

  const handleReview = async () => {
    if (!selectedRequest || !reviewAction) return;

    setSubmitting(true);

    try {
      const { error } = await supabase.rpc('review_verification', {
        _request_id: selectedRequest.id,
        _approved: reviewAction === "approve",
        _notes: reviewNotes.trim() || null,
      });

      if (error) throw error;

      toast.success(
        reviewAction === "approve" 
          ? "Verification approved successfully" 
          : "Verification rejected"
      );

      // Update local state
      setRequests(prev => 
        prev.map(r => 
          r.id === selectedRequest.id 
            ? { 
                ...r, 
                status: reviewAction === "approve" ? "approved" : "rejected",
                admin_notes: reviewNotes.trim() || null,
                reviewed_at: new Date().toISOString()
              } 
            : r
        )
      );

      setShowReviewDialog(false);
      setSelectedRequest(null);
      setDocumentUrl(null);
    } catch (error: any) {
      console.error("Error reviewing verification:", error);
      toast.error(error.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  const pendingRequests = requests.filter(r => r.status === "pending");
  const reviewedRequests = requests.filter(r => r.status !== "pending");

  if (authLoading || loading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
      <Header />
      <main className="container py-8 md:py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">ID Verification Admin</h1>
              <p className="text-muted-foreground">
                Review and manage user identity verification requests
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-warning">{pendingRequests.length}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">
                  {requests.filter(r => r.status === "approved").length}
                </div>
                <div className="text-sm text-muted-foreground">Approved</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-destructive">
                  {requests.filter(r => r.status === "rejected").length}
                </div>
                <div className="text-sm text-muted-foreground">Rejected</div>
              </CardContent>
            </Card>
          </div>

          {/* Requests List */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Requests</CardTitle>
              <CardDescription>
                Click on a request to view the uploaded document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending">
                <TabsList className="mb-4">
                  <TabsTrigger value="pending">
                    Pending ({pendingRequests.length})
                  </TabsTrigger>
                  <TabsTrigger value="reviewed">
                    Reviewed ({reviewedRequests.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No pending verification requests</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingRequests.map(request => (
                        <div
                          key={request.id}
                          className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => viewDocument(request)}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={request.user_avatar || undefined} />
                            <AvatarFallback>
                              {request.user_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {request.user_name || "Unknown User"}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {request.user_email}
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(request.status)}
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(request.submitted_at).toLocaleDateString("en-IE")}
                            </div>
                          </div>
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="reviewed">
                  {reviewedRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileImage className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No reviewed requests yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reviewedRequests.map(request => (
                        <div
                          key={request.id}
                          className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => viewDocument(request)}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={request.user_avatar || undefined} />
                            <AvatarFallback>
                              {request.user_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {request.user_name || "Unknown User"}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {request.user_email}
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(request.status)}
                            <div className="text-xs text-muted-foreground mt-1">
                              Reviewed {request.reviewed_at ? new Date(request.reviewed_at).toLocaleDateString("en-IE") : ""}
                            </div>
                          </div>
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Document Viewer */}
          {selectedRequest && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Document Review</CardTitle>
                    <CardDescription>
                      Reviewing ID for {selectedRequest.user_name || "Unknown User"}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedRequest(null);
                      setDocumentUrl(null);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingDocument ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : documentUrl ? (
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden bg-muted/20">
                      <img
                        src={documentUrl}
                        alt="ID Document"
                        className="max-h-96 mx-auto object-contain"
                      />
                    </div>

                    {selectedRequest.admin_notes && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-sm font-medium mb-1">Admin Notes:</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedRequest.admin_notes}
                        </p>
                      </div>
                    )}

                    {selectedRequest.status === "pending" && (
                      <div className="flex gap-3">
                        <Button
                          className="flex-1 rounded-xl"
                          onClick={() => openReviewDialog("approve")}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1 rounded-xl"
                          onClick={() => openReviewDialog("reject")}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                    <p>Failed to load document</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approve" ? "Approve Verification" : "Reject Verification"}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "approve" 
                ? "This will grant the user a verified badge visible to other users."
                : "Please provide a reason for rejection so the user can resubmit."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              placeholder={
                reviewAction === "approve" 
                  ? "Optional notes..." 
                  : "Reason for rejection (e.g., 'Document is blurry, please resubmit a clearer photo')"
              }
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReviewDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant={reviewAction === "approve" ? "default" : "destructive"}
              onClick={handleReview}
              disabled={submitting || (reviewAction === "reject" && !reviewNotes.trim())}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : reviewAction === "approve" ? (
                "Confirm Approval"
              ) : (
                "Confirm Rejection"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
