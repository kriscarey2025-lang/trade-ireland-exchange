import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Loader2, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Clock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { categoryLabels } from "@/lib/categories";
import { postCategoryLabels } from "@/lib/postCategories";

interface FlaggedService {
  id: string;
  title: string;
  description: string | null;
  category: string;
  type: string;
  location: string | null;
  moderation_status: string;
  moderation_reason: string | null;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

export default function AdminModeration() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flaggedServices, setFlaggedServices] = useState<FlaggedService[]>([]);
  const [selectedService, setSelectedService] = useState<FlaggedService | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if user is admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (roleData) {
        setIsAdmin(true);
        await fetchFlaggedServices();
      }
      setLoading(false);
    };

    if (!authLoading) {
      checkAdminAndFetch();
    }
  }, [user, authLoading]);

  const fetchFlaggedServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select(`
        id,
        title,
        description,
        category,
        type,
        location,
        moderation_status,
        moderation_reason,
        created_at,
        user_id
      `)
      .eq('moderation_status', 'pending_review')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching flagged services:', error);
      toast.error('Failed to load flagged posts');
      return;
    }

    // Fetch user profiles separately
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(s => s.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const servicesWithProfiles = data.map(service => ({
        ...service,
        profiles: profileMap.get(service.user_id) || null
      }));

      setFlaggedServices(servicesWithProfiles as FlaggedService[]);
    } else {
      setFlaggedServices([]);
    }
  };

  const handleApprove = async (service: FlaggedService) => {
    setIsProcessing(true);
    
    const { error } = await supabase
      .from('services')
      .update({
        moderation_status: 'approved',
        moderation_reason: null,
        moderated_at: new Date().toISOString()
      })
      .eq('id', service.id);

    if (error) {
      toast.error('Failed to approve post');
      setIsProcessing(false);
      return;
    }

    // Log the action
    await supabase.from('moderation_logs').insert({
      service_id: service.id,
      action: 'approved',
      reason: adminNotes || 'Approved by admin',
      reviewed_by: user?.id
    });

    toast.success('Post approved');
    setSelectedService(null);
    setAdminNotes("");
    await fetchFlaggedServices();
    setIsProcessing(false);
  };

  const handleReject = async (service: FlaggedService) => {
    setIsProcessing(true);
    
    const { error } = await supabase
      .from('services')
      .update({
        moderation_status: 'rejected',
        moderation_reason: adminNotes || service.moderation_reason,
        moderated_at: new Date().toISOString(),
        status: 'inactive'
      })
      .eq('id', service.id);

    if (error) {
      toast.error('Failed to reject post');
      setIsProcessing(false);
      return;
    }

    // Log the action
    await supabase.from('moderation_logs').insert({
      service_id: service.id,
      action: 'rejected',
      reason: adminNotes || service.moderation_reason || 'Rejected by admin',
      reviewed_by: user?.id
    });

    toast.success('Post rejected');
    setSelectedService(null);
    setAdminNotes("");
    await fetchFlaggedServices();
    setIsProcessing(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
        <Header />
        <main className="container py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                You don't have permission to access this page.
              </p>
              <Button className="mt-4" onClick={() => navigate('/')}>
                Go Home
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
      <Header />
      <main className="container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Content Moderation</h1>
              <p className="text-muted-foreground">Review flagged posts</p>
            </div>
          </div>

          {flaggedServices.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                <p className="text-muted-foreground">
                  No posts are currently pending review.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {flaggedServices.length} post{flaggedServices.length !== 1 ? 's' : ''} pending review
              </p>
              
              {flaggedServices.map((service) => (
                <Card key={service.id} className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{service.title}</CardTitle>
                        <CardDescription className="mt-1">
                          By {service.profiles?.full_name || 'Unknown'} • {new Date(service.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm line-clamp-3">{service.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {categoryLabels[service.category as keyof typeof categoryLabels] || service.category}
                      </Badge>
                      <Badge variant="outline">
                        {postCategoryLabels[service.type as keyof typeof postCategoryLabels] || service.type}
                      </Badge>
                      {service.location && (
                        <Badge variant="outline">{service.location}</Badge>
                      )}
                    </div>

                    {service.moderation_reason && (
                      <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">AI Flag Reason:</p>
                            <p className="text-sm text-red-700 dark:text-red-300">{service.moderation_reason}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedService(service);
                          setAdminNotes("");
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(service)}
                        disabled={isProcessing}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(service)}
                        disabled={isProcessing}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Review Dialog */}
      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Post</DialogTitle>
            <DialogDescription>
              Review the flagged content and decide whether to approve or reject it.
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Title</h4>
                <p className="text-sm bg-muted p-3 rounded-lg">{selectedService.title}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-1">Description</h4>
                <p className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
                  {selectedService.description || 'No description'}
                </p>
              </div>

              {selectedService.moderation_reason && (
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">AI Flag Reason:</p>
                  <p className="text-sm text-red-700 dark:text-red-300">{selectedService.moderation_reason}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-1">Admin Notes (optional)</h4>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedService(null)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => selectedService && handleApprove(selectedService)}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedService && handleReject(selectedService)}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
