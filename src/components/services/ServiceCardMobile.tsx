import { useState, memo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Star, Send, Loader2, Zap, RefreshCw, Linkedin, Facebook, Instagram, Handshake } from "lucide-react";
import { categoryLabels, categoryIcons } from "@/lib/categories";
import { cn, formatDisplayName } from "@/lib/utils";
import { ServiceCategory, PostCategory } from "@/types";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import { FoundersBadge } from "@/components/profile/FoundersBadge";
import { format, isToday, isTomorrow, differenceInDays, formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useStartConversation, useGetOrCreateConversation } from "@/hooks/useMessaging";
import { toast } from "sonner";

interface ServiceUser {
  id?: string;
  name: string;
  avatar?: string;
  rating: number | null;
  completedTrades: number;
  verificationStatus: "verified" | "pending" | "unverified";
  linkedinUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
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
  createdAt?: Date;
  completedSwapsCount?: number;
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

function ServiceCardMobileComponent({ service, className }: ServiceCardMobileProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const startConversation = useStartConversation();
  const getOrCreateConversation = useGetOrCreateConversation();
  const [quickMessage, setQuickMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const neededByLabel = getNeededByLabel(service.neededByDate, service.isTimeSensitive);
  const hasImage = service.images && service.images.length > 0 && service.images[0];
  const postType = getPostTypeLabel(service.type);
  const isOwnService = service.user?.id === user?.id;
  const isSkillSwap = service.type === "skill_swap";

  const handleSendMessage = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!quickMessage.trim() || !service.user?.id) return;

    if (!user) {
      toast.error("Please sign in to message");
      navigate("/auth");
      return;
    }

    setIsSending(true);
    try {
      const conversationId = await startConversation.mutateAsync({
        providerId: service.user.id,
        serviceId: service.id,
        initialMessage: quickMessage.trim(),
      });
      
      toast.success("Message sent!");
      setQuickMessage("");
      navigate(`/messages/${conversationId}`);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  }, [quickMessage, service.user?.id, service.id, user, navigate, startConversation]);

  const handleInitiateTrade = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please sign in to initiate a trade");
      navigate("/auth");
      return;
    }

    if (!service.user?.id) {
      toast.error("Unable to contact this user");
      return;
    }

    try {
      const conversationId = await getOrCreateConversation.mutateAsync({
        providerId: service.user.id,
        serviceId: service.id,
      });
      navigate(`/messages/${conversationId}?newTrade=true`);
    } catch (error) {
      toast.error("Failed to open conversation");
    }
  }, [user, service.user?.id, service.id, navigate, getOrCreateConversation]);

  return (
    <div className={cn("relative bg-card rounded-xl border border-border overflow-hidden service-card-mobile", className)}>
      <Link 
        to={`/services/${service.id}`} 
        className="block active:scale-[0.98] transition-transform"
      >
        {/* Image Container - Square aspect ratio with fixed dimensions to prevent CLS */}
        <div 
          className={cn(
            "relative aspect-square overflow-hidden bg-muted",
            service.isTimeSensitive && "ring-2 ring-warning ring-inset"
          )}
          style={{ contentVisibility: 'auto', containIntrinsicSize: '0 150px' }}
        >
          {hasImage ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 bg-muted animate-pulse" aria-hidden="true" />
              )}
              <img 
                src={service.images![0]} 
                alt={`${service.title} - ${categoryLabels[service.category]} service in ${service.location}`}
                width={300}
                height={300}
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-200",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                loading="lazy"
                decoding="async"
                onLoad={() => setImageLoaded(true)}
              />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-br from-primary/5 to-primary/10">
              <span className="text-3xl mb-2" aria-hidden="true">{categoryIcons[service.category]}</span>
              <p className="text-xs text-center text-muted-foreground line-clamp-3 px-1">
                {service.description || service.title}
              </p>
            </div>
          )}
          
          {/* Time Sensitive Badge */}
          {service.isTimeSensitive && (
            <div className="absolute top-1.5 left-1.5 bg-warning text-warning-foreground px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-0.5">
              <Zap className="h-2.5 w-2.5" />
              {neededByLabel}
            </div>
          )}
          
          {/* Post Type Badge */}
          <div className="absolute top-1.5 right-1.5 bg-background/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-medium">
            {postType.emoji} {postType.label}
          </div>
        </div>
        
        {/* Content Below Image - Cleaner layout */}
        <div className="p-2.5 space-y-2">
          {/* Title */}
          <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
            {service.title}
          </h3>
          
          {/* Category & Location & Date */}
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>{categoryLabels[service.category]}</span>
            <span>·</span>
            <MapPin className="h-2.5 w-2.5" />
            <span className="truncate max-w-[60px]">{service.location}</span>
            {service.createdAt && (
              <>
                <span>·</span>
                <span className="shrink-0">{formatDistanceToNow(service.createdAt, { addSuffix: false }).replace('about ', '').replace('less than a minute', 'now')}</span>
              </>
            )}
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

          {/* User Info - Clean single row with essential info only */}
          {service.user && (
            <Link
              to={`/profile/${service.user.id}`}
              className="flex items-center gap-2 pt-2 border-t border-border hover:opacity-80 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="h-7 w-7 ring-1 ring-border shrink-0">
                <AvatarImage src={service.user.avatar} alt={service.user.name} className="object-cover" />
                <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                  {service.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium truncate max-w-[70px] hover:underline">
                    {formatDisplayName(service.user.name).split(' ')[0]}
                  </span>
                  <VerifiedBadge status={service.user.verificationStatus} size="sm" />
                  {service.user.isFounder && <FoundersBadge size="sm" />}
                </div>
                {/* Rating & Swaps on second line */}
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  {service.user.rating !== null && (
                    <span className="flex items-center gap-0.5 text-warning">
                      <Star className="h-2.5 w-2.5 fill-current" />
                      {service.user.rating.toFixed(1)}
                    </span>
                  )}
                  {(service.user.completedTrades ?? 0) > 0 && (
                    <>
                      {service.user.rating !== null && <span>·</span>}
                      <span className="text-primary font-medium">
                        {service.user.completedTrades} swaps
                      </span>
                    </>
                  )}
                </div>
              </div>
              {/* Social icons - compact on the right */}
              {(service.user.linkedinUrl || service.user.facebookUrl || service.user.instagramUrl) && (
                <div className="flex items-center gap-1 shrink-0">
                  {service.user.linkedinUrl && (
                    <a 
                      href={service.user.linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Linkedin className="h-3.5 w-3.5 text-[#0A66C2]" />
                    </a>
                  )}
                  {service.user.facebookUrl && (
                    <a 
                      href={service.user.facebookUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Facebook className="h-3.5 w-3.5 text-[#1877F2]" />
                    </a>
                  )}
                  {service.user.instagramUrl && (
                    <a 
                      href={service.user.instagramUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Instagram className="h-3.5 w-3.5 text-[#E4405F]" />
                    </a>
                  )}
                </div>
              )}
            </Link>
          )}
        </div>
      </Link>

      {/* Quick Message & Action Buttons - inside card padding */}
      {user && service.user?.id && !isOwnService && (
        <div className="px-2.5 pb-2.5 space-y-2" onClick={(e) => e.preventDefault()}>
          {/* Quick Message */}
          <div className="flex items-center gap-1.5">
            <Input
              placeholder="Say hi or ask..."
              value={quickMessage}
              onChange={(e) => setQuickMessage(e.target.value)}
              className="h-8 text-xs flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && quickMessage.trim()) {
                  e.preventDefault();
                  handleSendMessage(e as unknown as React.MouseEvent);
                }
              }}
            />
            <Button
              size="sm"
              className="h-8 px-2.5 shrink-0"
              disabled={!quickMessage.trim() || isSending}
              onClick={handleSendMessage}
            >
              {isSending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
          
          {/* Action Buttons - Compact icons */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[10px]"
              asChild
            >
              <Link to={`/services/${service.id}`}>
                Read more
              </Link>
            </Button>
            <Button
              size="icon"
              className="h-7 w-7"
              onClick={handleInitiateTrade}
              disabled={getOrCreateConversation.isPending}
              title="Initiate Trade"
            >
              {getOrCreateConversation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Handshake className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* For non-logged-in users, show simple action buttons */}
      {!user && (
        <div className="px-2.5 pb-2.5 flex items-center gap-1.5" onClick={(e) => e.preventDefault()}>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-[10px]"
            asChild
          >
            <Link to={`/services/${service.id}`}>
              Read more
            </Link>
          </Button>
          <Button
            variant="default"
            size="icon"
            className="h-7 w-7"
            onClick={() => navigate("/auth")}
            title="Sign in to trade"
          >
            <Handshake className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders in lists
export const ServiceCardMobile = memo(ServiceCardMobileComponent);
