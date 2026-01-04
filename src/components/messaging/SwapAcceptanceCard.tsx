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
  ArrowLeftRight,
  Play
} from "lucide-react";
import { format, isBefore, startOfToday, isToday, addDays } from "date-fns";
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
    agreedCompletionDate ? new Date(agreedCompletionDate) : addDays(new Date(), 7)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const queryClient = useQueryClient();

  const hasAccepted = isParticipant1 ? acceptedBy1 : acceptedBy2;
  const otherHasAccepted = isParticipant1 ? acceptedBy2 : acceptedBy1;
  const bothAccepted = acceptedBy1 && acceptedBy2;
  const completionDateReached = agreedCompletionDate && 
    (isBefore(new Date(agreedCompletionDate), startOfToday()) || isToday(new Date(agreedCompletionDate)));

  // Determine who initiated (first to accept)
  const initiatorIsParticipant1 = acceptedBy1 && !acceptedBy2;
  const initiatorIsParticipant2 = acceptedBy2 && !acceptedBy1;
  const currentUserInitiated = (isParticipant1 && initiatorIsParticipant1) || (!isParticipant1 && initiatorIsParticipant2);
  const otherUserInitiated = (isParticipant1 && initiatorIsParticipant2) || (!isParticipant1 && initiatorIsParticipant1);

  // Initial state: No one has initiated yet
  const noOneInitiated = !acceptedBy1 && !acceptedBy2;

  const sendTradeNotification = async (
    recipientId: string | null,
    notificationType: 'initiated' | 'accepted' | 'counter_proposal',
    proposedDate: string
  ) => {
    if (!recipientId) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await supabase.functions.invoke('send-skill-trade-notification', {
        body: {
          recipient_id: recipientId,
          sender_id: user.id,
          conversation_id: conversationId,
          notification_type: notificationType,
          proposed_date: proposedDate,
          service_title: serviceTitle
        }
      });
    } catch (error) {
      console.error('Failed to send trade notification:', error);
    }
  };

  const handleInitiateSwap = async () => {
    if (!selectedDate) {
      toast.error("Please select a completion date first");
      return;
    }

    setIsSubmitting(true);
    try {
      const updateField = isParticipant1 ? "accepted_by_1" : "accepted_by_2";
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      
      // Get the other participant's ID
      const { data: conversation } = await supabase
        .from("conversations")
        .select("participant_1, participant_2")
        .eq("id", conversationId)
        .single();

      const { error } = await supabase
        .from("conversations")
        .update({ 
          [updateField]: true,
          agreed_completion_date: dateString,
          swap_status: 'pending'
        })
        .eq("id", conversationId);

      if (error) throw error;

      // Send email notification
      const recipientId = isParticipant1 ? conversation?.participant_2 : conversation?.participant_1;
      await sendTradeNotification(recipientId, 'initiated', dateString);

      await queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      
      toast.success(`Skill trade request sent to ${otherUserName}!`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to initiate swap");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptSwap = async () => {
    setIsSubmitting(true);
    try {
      const updateField = isParticipant1 ? "accepted_by_1" : "accepted_by_2";
      
      // Get the other participant's ID
      const { data: conversation } = await supabase
        .from("conversations")
        .select("participant_1, participant_2, agreed_completion_date")
        .eq("id", conversationId)
        .single();

      const { error } = await supabase
        .from("conversations")
        .update({ 
          [updateField]: true,
          swap_status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq("id", conversationId);

      if (error) throw error;

      // Send email notification
      const recipientId = isParticipant1 ? conversation?.participant_2 : conversation?.participant_1;
      await sendTradeNotification(recipientId, 'accepted', conversation?.agreed_completion_date || '');

      await queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      
      toast.success("Skill trade accepted! Exchange is now in progress.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to accept swap");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProposeNewDate = async () => {
    if (!selectedDate) {
      toast.error("Please select a new date first");
      return;
    }

    setIsSubmitting(true);
    try {
      // Reset the other party's acceptance and set our acceptance with new date
      const myAcceptField = isParticipant1 ? "accepted_by_1" : "accepted_by_2";
      const otherAcceptField = isParticipant1 ? "accepted_by_2" : "accepted_by_1";
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      
      // Get the other participant's ID
      const { data: conversation } = await supabase
        .from("conversations")
        .select("participant_1, participant_2")
        .eq("id", conversationId)
        .single();

      const { error } = await supabase
        .from("conversations")
        .update({ 
          [myAcceptField]: true,
          [otherAcceptField]: false, // Reset other party's acceptance
          agreed_completion_date: dateString,
          swap_status: 'pending'
        })
        .eq("id", conversationId);

      if (error) throw error;

      // Send email notification
      const recipientId = isParticipant1 ? conversation?.participant_2 : conversation?.participant_1;
      await sendTradeNotification(recipientId, 'counter_proposal', dateString);

      await queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      setShowDatePicker(false);
      
      toast.success(`New date proposed! Waiting for ${otherUserName} to accept.`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to propose new date");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If swap is closed or completed, don't show this card
  if (swapStatus === 'closed' || swapStatus === 'completed') {
    return null;
  }

  // In Progress state - both accepted, waiting for completion date
  if (bothAccepted && swapStatus === 'accepted' && !completionDateReached) {
    return (
      <Card className="border-blue-500/30 bg-blue-50 dark:bg-blue-950/20 mb-4">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-sm text-blue-700 dark:text-blue-400">
                Skill Trade In Progress
              </span>
            </div>
            
            {agreedCompletionDate && (
              <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full">
                <CalendarIcon className="h-3 w-3" />
                Complete by {format(new Date(agreedCompletionDate), 'dd MMM yyyy')}
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Both parties have agreed! Complete your skill exchange by the agreed date.
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              You accepted
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              {otherUserName} accepted
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Completion date reached - show different UI
  if (bothAccepted && completionDateReached) {
    return (
      <Card className="border-green-500/30 bg-green-50 dark:bg-green-950/20 mb-4">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="font-medium text-sm text-green-700 dark:text-green-400">
              Completion Date Reached!
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Mark the trade as complete below and leave a review.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-primary/5 mb-4">
      <CardContent className="p-4 space-y-3">
        {/* No one has initiated yet - Show "Initiate Skill Trade" */}
        {noOneInitiated && (
          <>
            <div className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-primary" />
              <span className="font-medium text-sm">Initiate Skill Trade</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Ready to exchange skills{serviceTitle ? ` for "${serviceTitle}"` : ''}? Select a target completion date and send a trade request.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2">
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

              <Button 
                onClick={handleInitiateSwap}
                disabled={isSubmitting || !selectedDate}
                className="gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowLeftRight className="h-4 w-4" />
                )}
                Initiate Skill Trade
              </Button>
            </div>
          </>
        )}

        {/* Current user initiated, waiting for other party */}
        {currentUserInitiated && !bothAccepted && (
          <>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <span className="font-medium text-sm">Awaiting Response</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              You've sent a skill trade request to {otherUserName} with a proposed completion date of{' '}
              <strong>{agreedCompletionDate && format(new Date(agreedCompletionDate), 'PPP')}</strong>.
            </p>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Waiting for {otherUserName} to accept or propose a different date...</span>
            </div>
          </>
        )}

        {/* Other user initiated, current user needs to respond */}
        {otherUserInitiated && !bothAccepted && (
          <>
            <div className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-primary" />
              <span className="font-medium text-sm">Skill Trade Request</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {otherUserName} wants to exchange skills{serviceTitle ? ` for "${serviceTitle}"` : ''}!
            </p>

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">
                <strong>Proposed completion date:</strong>{' '}
                {agreedCompletionDate && format(new Date(agreedCompletionDate), 'PPP')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleAcceptSwap}
                disabled={isSubmitting}
                className="flex-1 gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Accept Trade
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setShowDatePicker(!showDatePicker)}
                disabled={isSubmitting}
                className="flex-1 gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
                Propose Different Date
              </Button>
            </div>

            {/* Date picker for proposing new date */}
            {showDatePicker && (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                <p className="text-sm font-medium">Select a new completion date:</p>
                <div className="flex flex-col sm:flex-row gap-2">
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
                        {selectedDate ? format(selectedDate, "PPP") : "Select new date"}
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

                  <Button 
                    onClick={handleProposeNewDate}
                    disabled={isSubmitting || !selectedDate}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowLeftRight className="h-4 w-4" />
                    )}
                    Send Counter-Proposal
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This will send the request back to {otherUserName} with your proposed date.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
