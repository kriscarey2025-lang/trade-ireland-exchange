import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Sparkles, Send, CheckCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { serviceUrl as buildServiceUrl } from "@/lib/slugify";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import { FoundersBadge } from "@/components/profile/FoundersBadge";
import { useStartConversation } from "@/hooks/useMessaging";
import { toast } from "sonner";
import { fireConfetti } from "@/hooks/useConfetti";
import { formatDisplayName } from "@/lib/utils";

interface AIMatchCardProps {
  match: {
    service_id: string;
    match_score: number;
    match_reason: string;
    swap_potential: string;
    service: {
      id: string;
      title: string;
      description: string;
      category: string;
      type: string;
      location: string;
      images: string[];
    };
    provider: {
      id: string;
      full_name: string;
      avatar_url: string;
      location: string;
      verification_status: string;
      is_founder?: boolean;
    };
  };
  isNewMatch?: boolean;
}

const PLACEHOLDER_MESSAGES = [
  "Hi! I'd love to swap skills with you! 👋",
  "Hey! I think we'd be a great match for a swap!",
  "Hi there! Interested in a skill exchange?",
];

export function AIMatchCard({ match, isNewMatch }: AIMatchCardProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const navigate = useNavigate();
  const startConversation = useStartConversation();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500/20 text-green-700 border-green-500/30";
    if (score >= 60) return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
    return "bg-orange-500/20 text-orange-700 border-orange-500/30";
  };


  const getPlaceholder = () => {
    const index = Math.floor(Math.random() * PLACEHOLDER_MESSAGES.length);
    return PLACEHOLDER_MESSAGES[index];
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Please write a message first");
      return;
    }

    setIsSending(true);
    try {
      const conversationId = await startConversation.mutateAsync({
        serviceId: match.service.id,
        providerId: match.provider.id,
        initialMessage: message.trim(),
      });

      fireConfetti();
      
      toast.success("Message sent! 🎉", {
        description: "Great job making the first move!",
      });
      
      setMessageSent(true);
      setMessage("");
      
      // Navigate to conversation after a short delay
      setTimeout(() => {
        navigate(`/messages/${conversationId}`);
      }, 1500);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 ${isNewMatch ? 'ring-2 ring-primary/50' : ''}`}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="relative w-full md:w-48 h-40 md:h-auto flex-shrink-0">
            {match.service.images?.[0] ? (
              <img
                src={match.service.images[0]}
                alt={match.service.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-primary/50" />
              </div>
            )}
            <Badge 
              className={`absolute top-2 left-2 ${getScoreColor(match.match_score)} border`}
            >
              {match.match_score}% Match
            </Badge>
            {isNewMatch && (
              <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                New!
              </Badge>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={match.service.type === 'offer' ? 'default' : 'secondary'} className="text-xs">
                    {match.service.type === 'offer' ? 'Offering' : 'Looking for'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {match.service.category}
                  </Badge>
                </div>
                <Link to={buildServiceUrl(match.service.title, match.service.id)} className="hover:underline">
                  <h3 className="font-semibold text-lg line-clamp-1">{match.service.title}</h3>
                </Link>
              </div>
            </div>

            {/* AI Match Reason */}
            <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
              <div className="flex items-center gap-2 text-primary text-sm font-medium mb-1">
                <Sparkles className="h-4 w-4" />
                Why this matches
              </div>
              <p className="text-sm text-muted-foreground">{match.match_reason}</p>
            </div>

            {/* Swap Potential */}
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">Swap idea:</span> {match.swap_potential}
              </span>
            </div>

            {/* Provider Info */}
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <Link
                to={`/profile/${match.provider.id}`}
                className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={match.provider?.avatar_url} />
                  <AvatarFallback>
                    {match.provider?.full_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <span className="text-sm font-medium truncate hover:underline">{formatDisplayName(match.provider?.full_name)}</span>
                  {match.provider?.verification_status === 'verified' && (
                    <VerifiedBadge status="verified" size="sm" />
                  )}
                  {match.provider?.is_founder && (
                    <FoundersBadge size="sm" />
                  )}
                  {match.service.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground ml-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{match.service.location}</span>
                    </div>
                  )}
                </div>
              </Link>
            </div>

            {/* Inline Message Input */}
            {messageSent ? (
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 p-3 rounded-lg text-sm">
                <CheckCircle className="h-4 w-4" />
                Message sent! Taking you to the conversation...
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder={getPlaceholder()}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 min-w-0 text-sm px-3 py-2 rounded-md border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  maxLength={200}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isSending}
                  className="px-3"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
