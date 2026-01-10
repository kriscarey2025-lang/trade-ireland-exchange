import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send, MessageCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { trackContactInitiated } from "@/hooks/useEngagementTracking";

interface ProfileContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
  profileName: string;
}

export function ProfileContactDialog({
  open,
  onOpenChange,
  profileId,
  profileName,
}: ProfileContactDialogProps) {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const startConversation = useMutation({
    mutationFn: async ({ providerId, initialMessage }: { 
      providerId: string; 
      initialMessage: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Check if conversation already exists (without a service - profile-to-profile)
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .is("service_id", null)
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${providerId}),and(participant_1.eq.${providerId},participant_2.eq.${user.id})`)
        .maybeSingle();

      let conversationId: string;

      if (existing) {
        conversationId = existing.id;
      } else {
        const { data: newConv, error: convError } = await supabase
          .from("conversations")
          .insert({
            service_id: null,
            participant_1: user.id,
            participant_2: providerId,
          })
          .select()
          .single();

        if (convError) throw convError;
        conversationId = newConv.id;
      }

      // Send initial message
      const { error: msgError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: initialMessage,
        });

      if (msgError) throw msgError;

      // Track contact initiated (only for new conversations)
      if (!existing && user) {
        trackContactInitiated(user.id, conversationId, providerId);
      }

      return conversationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] });
      toast.success("Message sent!");
    },
    onError: () => {
      toast.error("Failed to start conversation");
    },
  });

  const handleSend = async () => {
    if (!message.trim()) return;

    const conversationId = await startConversation.mutateAsync({
      providerId: profileId,
      initialMessage: message,
    });

    onOpenChange(false);
    setMessage("");
    navigate(`/messages/${conversationId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Contact {profileName}
          </DialogTitle>
          <DialogDescription>
            Start a conversation with this member
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Your message</Label>
            <Textarea
              id="message"
              placeholder="Hi! I'd like to connect with you about..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={10000}
              className="resize-none"
            />
            {message.length > 9000 && (
              <p className="text-xs text-muted-foreground text-right">
                {message.length}/10000
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || startConversation.isPending}
          >
            {startConversation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
