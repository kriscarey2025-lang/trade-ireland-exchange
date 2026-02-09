import { useState, memo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Star, Send, Loader2, Zap, RefreshCw, Linkedin, Facebook, Instagram, Handshake, Globe, ExternalLink } from "lucide-react";
import { categoryLabels, categoryIcons } from "@/lib/categories";
import { cn, formatDisplayName } from "@/lib/utils";
import { ServiceCategory, PostCategory } from "@/types";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import { FoundersBadge } from "@/components/profile/FoundersBadge";
import { format, isToday, isTomorrow, differenceInDays } from "date-fns";
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
  websiteUrl?: string;
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

  // Check if user has social links or website
  const hasSocialLinks = service.user?.linkedinUrl || service.user?.facebookUrl || service.user?.instagramUrl || service.user?.websiteUrl;
  
  // Check if user has reviews or swaps
  const hasReviewsOrSwaps = (service.user?.rating !== null) || ((service.user?.completedTrades ?? 0) > 0);

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
    <div className={cn("relative bg-card rounded-xl border border-border overflow-hidden service-card-mobile w-full", className)}>
      <Link 
        to={`/services/${service.id}`} 
        className="block active:scale-[0.98] transition-transform"
      >
        {/* Compact header with badges */}
        <div className={cn(
          "flex items-center gap-3 px-3 py-2.5 border-b border-border",
          !hasImage && "bg-gradient-to-r from-primary/5 to-primary/10",
          service.isTimeSensitive && "ring-2 ring-warning ring-inset"
        )}>
          <span className="text-2xl" aria-hidden="true">{categoryIcons[service.category]}</span>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-muted-foreground">{categoryLabels[service.category]}</span>
          </div>
          <div className="flex items-center gap-2">
            {service.isTimeSensitive && (
              <span className="bg-warning text-warning-foreground px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-0.5">
                <Zap className="h-2.5 w-2.5" />
                {neededByLabel}
              </span>
            )}
            <span className="bg-background/80 px-1.5 py-0.5 rounded text-[10px] font-medium">
              {postType.emoji} {postType.label}
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-3 space-y-2.5">
          {/* Title - always first */}
          <h3 className="font-semibold text-base line-clamp-2 leading-snug">
            {service.title}
          </h3>

          {/* Image - after title */}
          {hasImage && (
            <div className="relative aspect-[16/10] overflow-hidden bg-muted rounded-lg">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-muted animate-pulse" aria-hidden="true" />
              )}
              <img 
                src={service.images![0]} 
                alt={`${service.title} - ${categoryLabels[service.category]} service in ${service.location}`}
                width={400}
                height={250}
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-200",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                loading="lazy"
                decoding="async"
                onLoad={() => setImageLoaded(true)}
              />
            </div>
          )}
          
          {/* Description - show for no-image posts */}
          {!hasImage && service.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 italic">
              "{service.description}"
            </p>
          )}
          
          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{service.location}</span>
            {hasImage && (
              <>
                <span>·</span>
                <span>{categoryLabels[service.category]}</span>
              </>
            )}
          </div>
          
          {/* What they want in exchange - for skill swaps */}
          {isSkillSwap && service.acceptedCategories && service.acceptedCategories.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <RefreshCw className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Wants:</span>
              <div className="flex gap-1 overflow-hidden">
                {service.acceptedCategories.includes("_open_to_all_") ? (
                  <span className="text-accent font-medium">Any skill ✨</span>
                ) : (
                  service.acceptedCategories
                    .filter(cat => !cat.startsWith("custom:") && cat !== "_open_to_all_")
                    .slice(0, 4)
                    .map(cat => (
                      <span key={cat} className="text-base" title={categoryLabels[cat as ServiceCategory]}>
                        {categoryIcons[cat as ServiceCategory]}
                      </span>
                    ))
                )}
                {service.acceptedCategories.filter(cat => !cat.startsWith("custom:") && cat !== "_open_to_all_").length > 4 && (
                  <span className="text-muted-foreground">+{service.acceptedCategories.filter(cat => !cat.startsWith("custom:") && cat !== "_open_to_all_").length - 4}</span>
                )}
              </div>
            </div>
          )}

          {/* User Info Row */}
          {service.user && (
            <Link
              to={`/profile/${service.user.id}`}
              className="flex items-center gap-2.5 pt-2.5 border-t border-border hover:opacity-80 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="h-9 w-9 ring-1 ring-border shrink-0">
                <AvatarImage src={service.user.avatar} alt={service.user.name} className="object-cover object-top" />
                <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                  {service.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-medium truncate hover:underline">
                    {formatDisplayName(service.user.name)}
                  </span>
                  {service.user.isFounder && <FoundersBadge size="sm" />}
                </div>
                {service.user.verificationStatus === 'verified' && (
                  <VerifiedBadge status={service.user.verificationStatus} size="sm" showLabel />
                )}
              </div>
            </Link>
          )}

          {/* Dedicated Frames Section */}
          {(hasSocialLinks || hasReviewsOrSwaps) && (
            <div className="flex flex-wrap gap-2 pt-1">
              {/* Reviews & Swaps Frame */}
              {hasReviewsOrSwaps && (
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-secondary/50 border border-border">
                  {(service.user?.completedTrades ?? 0) > 0 && (
                    <span className="flex items-center gap-1 text-xs font-medium text-accent">
                      <Handshake className="h-3.5 w-3.5" />
                      {service.user?.completedTrades}
                    </span>
                  )}
                  {service.user?.rating !== null && (
                    <>
                      {(service.user?.completedTrades ?? 0) > 0 && <span className="text-border">|</span>}
                      <span className="flex items-center gap-1 text-xs font-medium text-warning">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {service.user?.rating?.toFixed(1)}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Social & Website Frame */}
              {hasSocialLinks && (
                <div 
                  className="flex items-center gap-4 px-3 py-2 rounded-lg bg-secondary/50 border border-border"
                  onClick={(e) => e.stopPropagation()}
                >
                  {service.user?.websiteUrl && (
                    <a 
                      href={service.user.websiteUrl.startsWith('http') ? service.user.websiteUrl : `https://${service.user.websiteUrl}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:opacity-70 transition-opacity p-1"
                      title="Visit website"
                    >
                      <Globe className="h-5 w-5 text-primary" />
                    </a>
                  )}
                  {service.user?.linkedinUrl && (
                    <a 
                      href={service.user.linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:opacity-70 transition-opacity p-1"
                      title="View LinkedIn profile"
                    >
                      <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                    </a>
                  )}
                  {service.user?.facebookUrl && (
                    <a 
                      href={service.user.facebookUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:opacity-70 transition-opacity p-1"
                      title="View Facebook profile"
                    >
                      <Facebook className="h-5 w-5 text-[#1877F2]" />
                    </a>
                  )}
                  {service.user?.instagramUrl && (
                    <a 
                      href={service.user.instagramUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:opacity-70 transition-opacity p-1"
                      title="View Instagram profile"
                    >
                      <Instagram className="h-5 w-5 text-[#E4405F]" />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Quick Message & Action Buttons */}
      {user && service.user?.id && !isOwnService && (
        <div className="px-3 pb-3 space-y-2" onClick={(e) => e.preventDefault()}>
          {/* Quick Message */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Say hi or ask..."
              value={quickMessage}
              onChange={(e) => setQuickMessage(e.target.value)}
              className="h-9 text-sm flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && quickMessage.trim()) {
                  e.preventDefault();
                  handleSendMessage(e as unknown as React.MouseEvent);
                }
              }}
            />
            <Button
              size="sm"
              className="h-9 px-3 shrink-0"
              disabled={!quickMessage.trim() || isSending}
              onClick={handleSendMessage}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs flex-1"
              asChild
            >
              <Link to={`/services/${service.id}`}>
                Read more
              </Link>
            </Button>
            <Button
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={handleInitiateTrade}
              disabled={getOrCreateConversation.isPending}
            >
              {getOrCreateConversation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Handshake className="h-4 w-4 mr-1.5" />
                  Trade
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* For non-logged-in users */}
      {!user && (
        <div className="px-3 pb-3 flex items-center gap-2" onClick={(e) => e.preventDefault()}>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs flex-1"
            asChild
          >
            <Link to={`/services/${service.id}`}>
              Read more
            </Link>
          </Button>
          <Button
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={() => navigate("/auth")}
          >
            <Handshake className="h-4 w-4 mr-1.5" />
            Trade
          </Button>
        </div>
      )}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders in lists
export const ServiceCardMobile = memo(ServiceCardMobileComponent);
