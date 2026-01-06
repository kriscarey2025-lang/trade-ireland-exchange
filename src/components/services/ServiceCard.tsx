import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Star, ArrowUpRight, Linkedin, Facebook, Instagram, RefreshCw, Share2, Copy, Handshake, Send, Loader2 } from "lucide-react";
import { categoryLabels, categoryIcons } from "@/lib/categories";
import { cn, formatDisplayName } from "@/lib/utils";
import { ServiceCategory, PostCategory } from "@/types";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import { FoundersBadge } from "@/components/profile/FoundersBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useGetOrCreateConversation, useStartConversation } from "@/hooks/useMessaging";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  estimatedHours?: number;
  acceptedCategories?: string[];
  images?: string[];
  completedSwapsCount?: number;
  user?: ServiceUser;
}

interface ServiceCardProps {
  service: ServiceData;
  className?: string;
}

const getPostTypeBadge = (type: PostCategory) => {
  switch (type) {
    case "free_offer":
      return { label: "🎁 Free Offer", variant: "secondary" as const, className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300" };
    case "help_request":
      return { label: "🙋 Looking for Help", variant: "accent" as const, className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300" };
    case "skill_swap":
      return { label: "🔄 Skill Swap", variant: "default" as const, className: "" };
  }
};

export function ServiceCard({
  service,
  className
}: ServiceCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const getOrCreateConversation = useGetOrCreateConversation();
  const startConversation = useStartConversation();
  const [quickMessage, setQuickMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const postTypeBadge = getPostTypeBadge(service.type);
  const isSkillSwap = service.type === "skill_swap";
  const isOwnService = service.user?.id === user?.id;

  const handleQuickMessage = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!quickMessage.trim() || !service.user?.id) return;

    setIsSending(true);
    try {
      const conversationId = await startConversation.mutateAsync({
        providerId: service.user.id,
        serviceId: service.id,
        initialMessage: quickMessage.trim(),
      });
      
      toast.success("Message sent!", {
        description: "You've started a conversation.",
      });
      setQuickMessage("");
      navigate(`/messages/${conversationId}`);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleInitiateSkillTrade = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please sign in to initiate a skill trade");
      navigate("/auth");
      return;
    }

    if (service.user?.id === user.id) {
      toast.error("You can't trade with yourself!");
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
      
      // Navigate to the conversation as a draft - user can compose their message
      navigate(`/messages/${conversationId}?newTrade=true`);
    } catch (error) {
      toast.error("Failed to open conversation");
    }
  };

  const shareUrl = `https://swap-skills.com/services/${service.id}`;
  const shareText = `Check out "${service.title}" on SwapSkills - Trade skills, not money! 🔄`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const handleShareFacebook = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, '_blank', 'width=600,height=400');
  };

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, '_blank');
  };

  const handleShareTikTok = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TikTok doesn't have a direct share URL, so we copy and prompt user
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    toast.success("Link copied for TikTok!", {
      description: "Paste it in your TikTok caption or bio.",
    });
  };

  const handleShareInstagram = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Instagram doesn't have a direct share URL for web, so we copy and prompt user
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    toast.success("Link copied for Instagram!", {
      description: "Paste it in your Instagram story or bio.",
    });
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };
  const hasImage = service.images && service.images.length > 0 && service.images[0];

  return <Link to={`/services/${service.id}`} className="h-full">
      <Card className={cn("group overflow-hidden hover-lift cursor-pointer border-[3px] border-primary/40 hover:border-primary bg-card transition-all duration-300 shadow-md h-full flex flex-col", className)}>
        {/* Service Image */}
        {hasImage && (
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] overflow-hidden bg-muted">
            <img 
              src={service.images![0]} 
              alt={service.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}
        <CardContent className={cn("p-5 flex-1 flex flex-col", hasImage && "pt-4")}>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <Badge variant={postTypeBadge.variant} className={cn("shrink-0 rounded-lg", postTypeBadge.className)}>
              {postTypeBadge.label}
            </Badge>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-xs text-muted-foreground font-medium">
              <span>{categoryIcons[service.category]}</span>
              <span className="hidden sm:inline">{categoryLabels[service.category]}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-display font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {service.title}
            <ArrowUpRight className="inline-block ml-1 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>

          {/* Description - always show */}
          {service.description && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 italic">
              "{service.description}"
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary text-xs font-medium text-secondary-foreground">
              <MapPin className="h-3 w-3" />
              {service.location}
            </div>
            {service.estimatedHours && <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary text-xs font-medium text-secondary-foreground">
                <Clock className="h-3 w-3" />
                ~{service.estimatedHours}h
              </div>}
          </div>

          {/* Looking for in exchange - Only show for skill_swap */}
          {isSkillSwap && service.acceptedCategories && service.acceptedCategories.length > 0 && <div className="mb-4 space-y-2">
              {/* Show specific categories if any exist (excluding _open_to_all_) */}
              {service.acceptedCategories.filter(cat => cat !== "_open_to_all_").length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />
                    Wants:
                  </span>
                  {service.acceptedCategories.filter(cat => !cat.startsWith("custom:") && cat !== "_open_to_all_").slice(0, 4).map(cat => <span key={cat} className="text-base" title={categoryLabels[cat as ServiceCategory] || cat}>
                        {categoryIcons[cat as ServiceCategory] || "📋"}
                      </span>)}
                  {service.acceptedCategories.filter(cat => cat.startsWith("custom:")).length > 0 && <span className="text-xs text-muted-foreground">
                      +{service.acceptedCategories.filter(cat => cat.startsWith("custom:")).length} custom
                    </span>}
                  {service.acceptedCategories.filter(cat => !cat.startsWith("custom:") && cat !== "_open_to_all_").length > 4 && <span className="text-xs text-muted-foreground">
                      +{service.acceptedCategories.filter(cat => !cat.startsWith("custom:") && cat !== "_open_to_all_").length - 4}
                    </span>}
                </div>
              )}
              {/* Always show "Open to all" banner if selected */}
              {service.acceptedCategories.includes("_open_to_all_") && (
                <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-accent/10 border border-accent/30 shadow-sm">
                  <span className="text-sm">✨</span>
                  <span className="text-xs font-semibold text-accent">Open to all offers</span>
                </div>
              )}
            </div>}


          {/* User */}
          {service.user && <div className="flex items-center gap-3 pt-4 border-t border-border">
              <Avatar className="h-14 w-14 ring-2 ring-background shadow-md shrink-0">
                <AvatarImage src={service.user.avatar} alt={service.user.name} className="object-cover object-top" />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                  {service.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-medium text-sm truncate">
                    {formatDisplayName(service.user.name)}
                  </span>
                  <VerifiedBadge status={service.user.verificationStatus} size="sm" />
                  {service.user.isFounder && <FoundersBadge size="sm" />}
                  {/* Social Media Icons */}
                  {(service.user.linkedinUrl || service.user.facebookUrl || service.user.instagramUrl) && <div className="flex items-center gap-1 ml-1">
                      {service.user.linkedinUrl && <Linkedin className="h-3.5 w-3.5 text-[#0A66C2] shrink-0" />}
                      {service.user.facebookUrl && <Facebook className="h-3.5 w-3.5 text-[#1877F2] shrink-0" />}
                      {service.user.instagramUrl && <Instagram className="h-3.5 w-3.5 text-[#E4405F] shrink-0" />}
                    </div>}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {service.user.rating !== null ? <>
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      <span className="font-medium text-warning">{service.user.rating.toFixed(1)}</span>
                      <span>·</span>
                    </> : <span className="text-muted-foreground italic">No reviews</span>}
                  {(service.completedSwapsCount ?? 0) > 0 && <>
                      {service.user.rating !== null && <span>·</span>}
                      <span className="font-medium text-primary">{service.completedSwapsCount} swaps ✓</span>
                    </>}
                </div>
              </div>
            </div>}

          {/* Quick Message Field - Only for logged in users who don't own this service */}
          {user && service.user?.id && !isOwnService && (
            <div className="pt-3 border-t border-border space-y-2" onClick={(e) => e.preventDefault()}>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Say hi or ask a question..."
                  value={quickMessage}
                  onChange={(e) => setQuickMessage(e.target.value)}
                  className="h-9 text-sm flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && quickMessage.trim()) {
                      e.preventDefault();
                      handleQuickMessage(e);
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="h-9 px-3 shrink-0"
                  disabled={!quickMessage.trim() || isSending}
                  onClick={handleQuickMessage}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground text-center">
                💬 Most swaps start with a simple message. No pressure, no obligation.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-3 border-t border-border mt-auto">
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                className="h-7 px-2.5 bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
              >
                <span className="text-[11px] font-medium">Read more</span>
                <ArrowUpRight className="h-3 w-3" />
              </Button>
              {service.user?.id !== user?.id && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2.5 gap-1 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  onClick={handleInitiateSkillTrade}
                  disabled={getOrCreateConversation.isPending}
                >
                  <Handshake className="h-3 w-3" />
                  <span className="text-[11px] font-medium hidden sm:inline">Initiate Trade</span>
                </Button>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary gap-1.5"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="text-xs">Share</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleShareFacebook} className="cursor-pointer gap-2">
                  <Facebook className="h-4 w-4 text-[#1877F2]" />
                  <span>Facebook</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareWhatsApp} className="cursor-pointer gap-2">
                  <svg className="h-4 w-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>WhatsApp</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareTikTok} className="cursor-pointer gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                  <span>TikTok</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareInstagram} className="cursor-pointer gap-2">
                  <Instagram className="h-4 w-4 text-[#E4405F]" />
                  <span>Instagram</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer gap-2">
                  <Copy className="h-4 w-4 text-muted-foreground" />
                  <span>Copy link</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </Link>;
}