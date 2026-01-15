import { useState } from "react";
import { Button } from "@/components/ui/button";
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
      {/* Slim orange banner for mobile-friendly display */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg shadow-sm">
        <div className="px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span className="font-medium text-xs sm:text-sm">
                Swap Complete! Keep {serviceTitle ? `"${serviceTitle}"` : 'service'} open?
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowKeepRunningDialog(true)}
                disabled={isLoading}
                className="h-7 px-2 text-xs gap-1 bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <RefreshCw className="h-3 w-3" />
                <span className="hidden sm:inline">Keep</span> Open
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCloseService}
                disabled={isLoading}
                className="h-7 px-2 text-xs gap-1 bg-white/20 hover:bg-white/30 text-white border-0"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>

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
