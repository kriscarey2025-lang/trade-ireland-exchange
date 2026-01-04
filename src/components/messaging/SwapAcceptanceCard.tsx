import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Handshake, 
  CalendarIcon, 
  CheckCircle2, 
  Loader2,
  Clock,
  X
} from "lucide-react";
import { format, isBefore, startOfToday, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface SwapAcceptanceCardProps {
  conversationId: string;
  isParticipant1: boolean;
  acceptedBy1: boolean;
  acceptedBy2: boolean;
  agreedCompletionDate: string | null;
  swapStatus: string;
  otherUserName: string;
  serviceTitle?: string;
  onSwapCompleted?: () => void;
}

export function SwapAcceptanceCard({
  conversationId,
  isParticipant1,
  acceptedBy1,
  acceptedBy2,
  agreedCompletionDate,
  swapStatus,
  otherUserName,
  serviceTitle,
  onSwapCompleted
}: SwapAcceptanceCardProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    agreedCompletionDate ? new Date(agreedCompletionDate) : undefined
  );
  const [isAccepting, setIsAccepting] = useState(false);
  const [isUpdatingDate, setIsUpdatingDate] = useState(false);
  const queryClient = useQueryClient();

  const hasAccepted = isParticipant1 ? acceptedBy1 : acceptedBy2;
  const otherHasAccepted = isParticipant1 ? acceptedBy2 : acceptedBy1;
  const bothAccepted = acceptedBy1 && acceptedBy2;
  const completionDateReached = agreedCompletionDate && 
    (isBefore(new Date(agreedCompletionDate), startOfToday()) || isToday(new Date(agreedCompletionDate)));

  const handleAcceptSwap = async () => {
    if (!selectedDate) {
      toast.error("Please select a completion date first");
      return;
    }

    setIsAccepting(true);
    try {
      const updateField = isParticipant1 ? "accepted_by_1" : "accepted_by_2";
      
      const updateData: Record<string, unknown> = { 
        [updateField]: true,
        agreed_completion_date: format(selectedDate, 'yyyy-MM-dd')
      };

      // If both will have accepted after this, update status
      if (otherHasAccepted) {
        updateData.swap_status = 'accepted';
        updateData.accepted_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("conversations")
        .update(updateData)
        .eq("id", conversationId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      
      toast.success(
        otherHasAccepted 
          ? "Swap accepted! Both parties have agreed." 
          : "You've accepted! Waiting for the other party."
      );
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to accept swap");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleUpdateDate = async (date: Date) => {
    setIsUpdatingDate(true);
    try {
      const { error } = await supabase
        .from("conversations")
        .update({ agreed_completion_date: format(date, 'yyyy-MM-dd') })
        .eq("id", conversationId);

      if (error) throw error;

      setSelectedDate(date);
      await queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      toast.success("Completion date updated");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update date");
    } finally {
      setIsUpdatingDate(false);
    }
  };

  // If swap is closed, don't show anything
  if (swapStatus === 'closed') {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4 space-y-3">
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Handshake className="h-5 w-5 text-primary" />
            <span className="font-medium text-sm">
              {swapStatus === 'pending' && 'Swap Agreement'}
              {swapStatus === 'accepted' && 'Swap Accepted'}
              {swapStatus === 'completed' && 'Swap Completed'}
            </span>
          </div>
          
          {bothAccepted && agreedCompletionDate && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              <CalendarIcon className="h-3 w-3" />
              {format(new Date(agreedCompletionDate), 'dd MMM yyyy')}
            </div>
          )}
        </div>

        {/* Pending State - Date Selection & Accept */}
        {swapStatus === 'pending' && !hasAccepted && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {otherHasAccepted 
                ? `${otherUserName} has proposed a swap. Select a completion date and accept to confirm.`
                : `Propose a completion date for ${serviceTitle ? `"${serviceTitle}"` : 'this swap'}.`
              }
            </p>
            
            {/* Date Picker */}
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select completion date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => isBefore(date, startOfToday())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button 
              onClick={handleAcceptSwap}
              disabled={isAccepting || !selectedDate}
              className="w-full gap-2"
            >
              {isAccepting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Handshake className="h-4 w-4" />
              )}
              Accept Swap
            </Button>
          </div>
        )}

        {/* Waiting for other party */}
        {swapStatus === 'pending' && hasAccepted && !otherHasAccepted && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Waiting for {otherUserName} to accept...</span>
          </div>
        )}

        {/* Both Accepted - Show completion date and status */}
        {bothAccepted && agreedCompletionDate && !completionDateReached && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Both parties have agreed!</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Complete the skill exchange by {format(new Date(agreedCompletionDate), 'PPP')}. 
              You'll be able to leave reviews after that date.
            </p>
            
            {/* Option to update date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs">
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  Change date
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && handleUpdateDate(date)}
                  disabled={(date) => isBefore(date, startOfToday()) || isUpdatingDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Completion date reached - Show review prompt */}
        {bothAccepted && completionDateReached && swapStatus !== 'completed' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4" />
              <span>Completion date reached!</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Time to mark the swap as complete and leave a review.
            </p>
          </div>
        )}

        {/* Acceptance Status Badges */}
        <div className="flex flex-wrap gap-2">
          {hasAccepted && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              You accepted
            </span>
          )}
          {otherHasAccepted && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              {otherUserName} accepted
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
