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
import { Loader2, Send } from "lucide-react";
import { useStartConversation } from "@/hooks/useMessaging";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
  serviceTitle: string;
  providerId: string;
  providerName: string;
}

export function ContactDialog({
  open,
  onOpenChange,
  serviceId,
  serviceTitle,
  providerId,
  providerName,
}: ContactDialogProps) {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const startConversation = useStartConversation();

  const handleSend = async () => {
    if (!message.trim()) return;

    const conversationId = await startConversation.mutateAsync({
      serviceId,
      providerId,
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
          <DialogTitle>Contact {providerName}</DialogTitle>
          <DialogDescription>
            Send a message about "{serviceTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Your message</Label>
            <Textarea
              id="message"
              placeholder="Hi, I'm interested in your service..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
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
