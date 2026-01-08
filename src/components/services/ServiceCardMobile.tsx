import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Star, MessageCircle, Send, Loader2, Zap, RefreshCw, X } from "lucide-react";
import { categoryLabels, categoryIcons } from "@/lib/categories";
import { cn, formatDisplayName } from "@/lib/utils";
import { ServiceCategory, PostCategory } from "@/types";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import { FoundersBadge } from "@/components/profile/FoundersBadge";
import { format, isToday, isTomorrow, differenceInDays } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useStartConversation } from "@/hooks/useMessaging";
import { toast } from "sonner";

interface ServiceUser {
  id?: string;
  name: string;
  avatar?: string;
  rating: number | null;
  completedTrades: number;
  verificationStatus: "verified" | "pending" | "unverified";
  isFounder?: boolean;
}

interface ServiceData {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  type: PostCategory;
  location: string;
  images?: string[];
  acceptedCategories?: string[];
  isTimeSensitive?: boolean;
  neededByDate?: Date | null;
  user?: ServiceUser;
}

interface ServiceCardMobileProps {
  service: ServiceData;
  className?: string;
}

const getPostTypeLabel = (type: PostCategory) => {
  switch (type) {
    case "free_offer":
      return { emoji: "🎁", label: "Free" };
    case "help_request":
      return { emoji: "🙋", label: "Help" };
    case "skill_swap":
      return { emoji: "🔄", label: "Swap" };
  }
};

const getNeededByLabel = (date: Date | null | undefined, isTimeSensitive: boolean | undefined): string | null => {
  if (!isTimeSensitive) return null;
  if (!date) return "ASAP";
  
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  
  const daysAway = differenceInDays(date, new Date());
  if (daysAway <= 7) return `${daysAway}d`;
  
  return format(date, "MMM d");
};

export function ServiceCardMobile({ service, className }: ServiceCardMobileProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const startConversation = useStartConversation();
  const [showQuickMessage, setShowQuickMessage] = useState(false);
  const [quickMessage, setQuickMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const neededByLabel = getNeededByLabel(service.neededByDate, service.isTimeSensitive);
  const hasImage = service.images && service.images.length > 0 && service.images[0];
  const postType = getPostTypeLabel(service.type);
  const isOwnService = service.user?.id === user?.id;
  const isSkillSwap = service.type === "skill_swap";

  const handleMessageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error("Please sign in to message");
      navigate("/auth");
      return;
    }
    
    if (isOwnService) {
      toast.error("This is your own service");
      return;
    }
    
    setShowQuickMessage(true);
  };

  const handleSendMessage = async () => {
    if (!quickMessage.trim() || !service.user?.id) return;

    setIsSending(true);
    try {
      const conversationId = await startConversation.mutateAsync({
        providerId: service.user.id,
        serviceId: service.id,
        initialMessage: quickMessage.trim(),
      });
      
      toast.success("Message sent!");
      setQuickMessage("");
      setShowQuickMessage(false);
      navigate(`/messages/${conversationId}`);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Link 
        to={`/services/${service.id}`} 
        className="block"
      >
        {/* Image Container - Square aspect ratio like Vinted */}
        <div className={cn(
          "relative aspect-square rounded-lg overflow-hidden bg-muted",
          service.isTimeSensitive && "ring-2 ring-orange-400"
        )}>
          {hasImage ? (
            <img 
              src={service.images![0]} 
              alt={service.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-br from-primary/5 to-primary/10">
              <span className="text-3xl mb-2">{categoryIcons[service.category]}</span>
              <p className="text-xs text-center text-muted-foreground line-clamp-3 px-1">
                {service.description || service.title}
              </p>
            </div>
          )}
          
          {/* Time Sensitive Badge */}
          {service.isTimeSensitive && (
            <div className="absolute top-1.5 left-1.5 bg-orange-500 text-white px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-0.5">
              <Zap className="h-2.5 w-2.5" />
              {neededByLabel}
            </div>
          )}
          
          {/* Post Type Badge */}
          <div className="absolute top-1.5 right-1.5 bg-background/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-medium">
            {postType.emoji} {postType.label}
          </div>
          
          {/* Message Button Overlay - Like Vinted's heart */}
          {!isOwnService && (
            <button
              onClick={handleMessageClick}
              className="absolute bottom-2 right-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full p-2 shadow-md active:scale-95 transition-transform"
            >
              <MessageCircle className="h-5 w-5 text-primary" />
            </button>
          )}
        </div>
        
        {/* Content Below Image */}
        <div className="mt-2 space-y-1">
          {/* Title */}
          <h3 className="font-medium text-sm line-clamp-2 leading-tight">
            {service.title}
          </h3>
          
          {/* Category & Location */}
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>{categoryLabels[service.category]}</span>
            <span>·</span>
            <MapPin className="h-2.5 w-2.5" />
            <span className="truncate">{service.location}</span>
          </div>
          
          {/* What they want in exchange - for skill swaps */}
          {isSkillSwap && service.acceptedCategories && service.acceptedCategories.length > 0 && (
            <div className="flex items-center gap-1 text-[11px]">
              <RefreshCw className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Wants:</span>
              <div className="flex gap-0.5 overflow-hidden">
                {service.acceptedCategories.includes("_open_to_all_") ? (
                  <span className="text-accent font-medium">Any skill ✨</span>
                ) : (
                  service.acceptedCategories
                    .filter(cat => !cat.startsWith("custom:") && cat !== "_open_to_all_")
                    .slice(0, 3)
                    .map(cat => (
                      <span key={cat} title={categoryLabels[cat as ServiceCategory]}>
                        {categoryIcons[cat as ServiceCategory]}
                      </span>
                    ))
                )}
                {service.acceptedCategories.filter(cat => !cat.startsWith("custom:") && cat !== "_open_to_all_").length > 3 && (
                  <span className="text-muted-foreground">+{service.acceptedCategories.filter(cat => !cat.startsWith("custom:") && cat !== "_open_to_all_").length - 3}</span>
                )}
              </div>
            </div>
          )}
          
          {/* User Info */}
          {service.user && (
            <div className="flex items-center gap-1.5 pt-1">
              <Avatar className="h-5 w-5">
                <AvatarImage src={service.user.avatar} alt={service.user.name} className="object-cover" />
                <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                  {service.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-[11px] font-medium truncate">
                {formatDisplayName(service.user.name).split(' ')[0]}
              </span>
              <VerifiedBadge status={service.user.verificationStatus} size="sm" />
              {service.user.isFounder && <FoundersBadge size="sm" />}
              {service.user.rating !== null && (
                <span className="flex items-center gap-0.5 text-[11px] text-warning ml-auto">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  {service.user.rating.toFixed(1)}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Quick Message Overlay */}
      {showQuickMessage && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onClick={() => setShowQuickMessage(false)}
        >
          <div 
            className="w-full max-w-lg bg-card rounded-t-2xl p-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {service.user && (
                  <>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={service.user.avatar} alt={service.user.name} />
                      <AvatarFallback>{service.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{formatDisplayName(service.user.name)}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <VerifiedBadge status={service.user.verificationStatus} size="sm" />
                        {service.user.rating !== null && (
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-warning text-warning" />
                            {service.user.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button 
                onClick={() => setShowQuickMessage(false)}
                className="p-2 hover:bg-muted rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              Re: {service.title}
            </p>
            
            <div className="flex gap-2">
              <Input
                placeholder="Say hi or ask a question..."
                value={quickMessage}
                onChange={(e) => setQuickMessage(e.target.value)}
                className="flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && quickMessage.trim()) {
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!quickMessage.trim() || isSending}
                size="icon"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <p className="text-[11px] text-muted-foreground text-center mt-3">
              💬 Most swaps start with a simple message
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
