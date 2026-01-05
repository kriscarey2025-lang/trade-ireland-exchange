import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, MessageCircle, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { categoryLabels, categoryIcons } from "@/lib/categories";
import { useStartConversation } from "@/hooks/useMessaging";
import { toast } from "sonner";
import { fireConfetti } from "@/hooks/useConfetti";

interface Match {
  id: string;
  title: string;
  category: string;
  location: string;
  user_id: string;
  provider_name: string | null;
  provider_avatar: string | null;
}

interface PostCreationMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newServiceId: string;
  newServiceTitle: string;
  newServiceCategory: string;
  userId: string;
}

const PLACEHOLDER_MESSAGES = [
  "Hi! I'd love to swap skills with you! 👋",
  "Hey! I think we'd be a great match for a swap!",
  "Hi there! Interested in a skill exchange?",
];

export function PostCreationMatchDialog({
  open,
  onOpenChange,
  newServiceId,
  newServiceTitle,
  newServiceCategory,
  userId,
}: PostCreationMatchDialogProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const navigate = useNavigate();
  const startConversation = useStartConversation();

  useEffect(() => {
    if (open) {
      fetchMatches();
    }
  }, [open, newServiceCategory, userId]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      // Find services where:
      // 1. The provider is looking for skills in the category the user just posted
      // 2. Or their accepted_categories include the user's new service category
      const { data, error } = await supabase
        .rpc('get_public_services', {
          _status: 'active'
        });

      if (error) throw error;

      // Filter to find matches:
      // - Not the current user's services
      // - Their accepted_categories includes what we just posted
      const filteredMatches = (data || [])
        .filter((service: any) => {
          if (service.user_id === userId) return false;
          
          // Check if they accept the category we just posted
          const acceptedCategories = service.accepted_categories || [];
          const acceptsOurCategory = acceptedCategories.includes(newServiceCategory) ||
            acceptedCategories.includes('_open_to_all_');
          
          return acceptsOurCategory;
        })
        .slice(0, 5) // Limit to 5 matches
        .map((service: any) => ({
          id: service.id,
          title: service.title,
          category: service.category,
          location: service.location,
          user_id: service.user_id,
          provider_name: service.provider_name,
          provider_avatar: service.provider_avatar,
        }));

      setMatches(filteredMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSendMessage = async (match: Match) => {
    const matchMessage = messages[match.id]?.trim();
    if (!matchMessage) {
      toast.error("Please write a message first");
      return;
    }

    setSendingTo(match.id);
    try {
      const conversationId = await startConversation.mutateAsync({
        serviceId: match.id,
        providerId: match.user_id,
        initialMessage: matchMessage,
      });

      // Fire confetti on successful message send!
      fireConfetti();
      
      toast.success("Message sent! 🎉", {
        description: "Great job making the first move!",
      });
      
      // Clear message for this match and remove from list
      setMessages(prev => {
        const updated = { ...prev };
        delete updated[match.id];
        return updated;
      });
      setMatches(prev => prev.filter(m => m.id !== match.id));
      
      // If no more matches, close and navigate
      if (matches.length <= 1) {
        onOpenChange(false);
        navigate(`/messages/${conversationId}`);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error("Failed to send message");
    } finally {
      setSendingTo(null);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    navigate("/browse");
  };

  const getPlaceholder = (index: number) => {
    return PLACEHOLDER_MESSAGES[index % PLACEHOLDER_MESSAGES.length];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[80vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            People Want Your Skill!
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Make the first move - just say hi! 👋
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-6 space-y-3">
            <div className="text-3xl">🌱</div>
            <p className="text-muted-foreground text-sm">
              No matches yet - we'll notify you when someone's looking!
            </p>
            <Button onClick={handleSkip} variant="hero" size="sm">
              Continue Browsing
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Compact encouragement */}
            <div className="bg-primary/10 rounded-lg p-2 text-xs text-center">
              💡 First movers are 3x more likely to complete a swap!
            </div>

            {matches.map((match, index) => (
              <div
                key={match.id}
                className="border rounded-lg p-3 space-y-2"
              >
                {/* Compact match header */}
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarImage src={match.provider_avatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(match.provider_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {match.provider_name || "SwapSkills Member"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {match.title}
                    </p>
                  </div>
                </div>

                {/* Category & location compact */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs py-0 h-5">
                    {categoryIcons[match.category as keyof typeof categoryIcons]} {categoryLabels[match.category as keyof typeof categoryLabels] || match.category}
                  </Badge>
                  {match.location && (
                    <span className="text-xs text-muted-foreground">
                      📍 {match.location}
                    </span>
                  )}
                </div>

                {/* Inline message input - always visible */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={getPlaceholder(index)}
                    value={messages[match.id] || ""}
                    onChange={(e) => setMessages(prev => ({ ...prev, [match.id]: e.target.value }))}
                    className="flex-1 min-w-0 text-sm px-3 py-2 rounded-md border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    maxLength={200}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(match);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSendMessage(match)}
                    disabled={!messages[match.id]?.trim() || sendingTo === match.id}
                    className="px-3"
                  >
                    {sendingTo === match.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}

            {/* Compact footer */}
            <button
              className="w-full text-xs text-muted-foreground py-2 hover:text-foreground transition-colors"
              onClick={handleSkip}
            >
              Skip for now →
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
