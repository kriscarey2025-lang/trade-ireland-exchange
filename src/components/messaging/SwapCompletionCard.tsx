import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle2, 
  Loader2,
  RefreshCw,
  XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SwapCompletionCardProps {
  conversationId: string;
  serviceId: string | null;
  serviceTitle?: string;
  isServiceOwner: boolean;
  bothReviewed: boolean;
  swapStatus: string;
  onClose?: () => void;
}

export function SwapCompletionCard({
  conversationId,
  serviceId,
  serviceTitle,
  isServiceOwner,
  bothReviewed,
  swapStatus,
  onClose
}: SwapCompletionCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showKeepRunningDialog, setShowKeepRunningDialog] = useState(false);
  const queryClient = useQueryClient();

  // Only show to service owner after swap is auto-completed (both reviewed) and not yet closed
  if (!isServiceOwner || swapStatus !== 'completed') {
    return null;
  }

  const handleKeepRunning = async () => {
    setIsLoading(true);
    try {
      // Swap count is already incremented by the auto_complete_swap_on_review trigger
      // Just keep the service running (status stays as 'completed', not 'closed')
      await queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      await queryClient.invalidateQueries({ queryKey: ["services"] });
      
      toast.success("Swap completed! Your service remains active for more swaps.");
      setShowKeepRunningDialog(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseService = async () => {
    setIsLoading(true);
    try {
      // Swap count is already incremented by the auto_complete_swap_on_review trigger
      // Mark conversation as closed and service as completed
      const { error: convError } = await supabase
        .from("conversations")
        .update({ swap_status: 'closed' })
        .eq("id", conversationId);

      if (convError) throw convError;

      if (serviceId) {
        const { error: serviceError } = await supabase
          .from("services")
          .update({ status: 'completed' })
          .eq("id", serviceId);

        if (serviceError) throw serviceError;
      }

      await queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      await queryClient.invalidateQueries({ queryKey: ["services"] });
      
      toast.success("Service closed. Thanks for swapping!");
      onClose?.();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to close service");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="border-green-500/30 bg-green-50 dark:bg-green-950/20">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="font-medium text-sm text-green-700 dark:text-green-400">
              Swap Complete!
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            Both reviews are in. Would you like to keep {serviceTitle ? `"${serviceTitle}"` : 'your service'} open for more swaps, or close it?
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowKeepRunningDialog(true)}
              disabled={isLoading}
              className="flex-1 gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Keep Running
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCloseService}
              disabled={isLoading}
              className="flex-1 gap-2 text-destructive hover:text-destructive"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Close Service
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showKeepRunningDialog} onOpenChange={setShowKeepRunningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Keep Service Running?</AlertDialogTitle>
            <AlertDialogDescription>
              Your service will remain active and visible to others. The completed swap count will be updated. You can accept new swap requests from other members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleKeepRunning} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Yes, Keep Running
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
