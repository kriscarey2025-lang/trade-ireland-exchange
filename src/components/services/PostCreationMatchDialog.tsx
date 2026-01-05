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

const CONVERSATION_STARTERS = [
  "Hi! I just posted my skill and saw yours - I think we could be a great match for a swap!",
  "Hey there! I noticed your skill and I'd love to explore a swap. What do you think?",
  "Hi! I'm new here and your skill caught my eye. Would you be open to trading skills?",
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
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [message, setMessage] = useState("");
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
    if (!message.trim()) {
      toast.error("Please write a message first");
      return;
    }

    setSendingTo(match.id);
    try {
      const conversationId = await startConversation.mutateAsync({
        serviceId: match.id,
        providerId: match.user_id,
        initialMessage: message,
      });

      toast.success("Message sent! 🎉", {
        description: "Great job making the first move!",
      });
      
      setMessage("");
      setSelectedMatch(null);
      
      // Ask if they want to message more or continue
      if (matches.length > 1) {
        // Stay in dialog to message more
      } else {
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

  const handleUseStarter = (starter: string) => {
    setMessage(starter);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            People Are Looking for Your Skill!
          </DialogTitle>
          <DialogDescription>
            These members want exactly what you just posted. Take the first step and say hi!
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <div className="text-4xl">🌱</div>
            <p className="text-muted-foreground">
              No matches yet, but don't worry! We'll notify you when someone's looking for your skill.
            </p>
            <Button onClick={handleSkip} variant="hero">
              Continue to Browse
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Encouragement message */}
            <div className="bg-primary/10 rounded-lg p-3 text-sm text-center">
              <span className="font-medium">💡 Pro tip:</span> People who make the first move are 3x more likely to complete a swap!
            </div>

            {matches.map((match) => (
              <div
                key={match.id}
                className="border rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors"
              >
                {/* Match header */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={match.provider_avatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(match.provider_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {match.provider_name || "SwapSkills Member"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {match.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {categoryIcons[match.category as keyof typeof categoryIcons]} {categoryLabels[match.category as keyof typeof categoryLabels] || match.category}
                      </Badge>
                      {match.location && (
                        <span className="text-xs text-muted-foreground">
                          📍 {match.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message input */}
                {selectedMatch?.id === match.id ? (
                  <div className="space-y-3">
                    {/* Quick starters */}
                    <div className="flex flex-wrap gap-1">
                      {CONVERSATION_STARTERS.map((starter, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="text-xs h-auto py-1 px-2"
                          onClick={() => handleUseStarter(starter)}
                        >
                          Use template {i + 1}
                        </Button>
                      ))}
                    </div>
                    
                    <Textarea
                      placeholder="Write a friendly message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="resize-none"
                      maxLength={500}
                    />
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedMatch(null);
                          setMessage("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSendMessage(match)}
                        disabled={!message.trim() || sendingTo === match.id}
                      >
                        {sendingTo === match.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Send className="h-4 w-4 mr-1" />
                        )}
                        Send
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedMatch(match)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Say Hello
                  </Button>
                )}
              </div>
            ))}

            {/* Footer */}
            <div className="pt-4 border-t space-y-2">
              <p className="text-xs text-center text-muted-foreground">
                Don't overthink it - a simple "hi" can lead to amazing swaps! 🌟
              </p>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={handleSkip}
              >
                Maybe later, browse more skills
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
