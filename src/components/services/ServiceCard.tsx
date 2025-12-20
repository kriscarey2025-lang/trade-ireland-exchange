import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Star, ArrowUpRight, Linkedin, Facebook, Instagram, RefreshCw, Share2 } from "lucide-react";
import { categoryLabels, categoryIcons } from "@/lib/categories";
import { cn, formatDisplayName } from "@/lib/utils";
import { ServiceCategory, PostCategory } from "@/types";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import { FoundersBadge } from "@/components/profile/FoundersBadge";
import { Button } from "@/components/ui/button";
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
  estimatedHours?: number;
  acceptedCategories?: string[];
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
  const postTypeBadge = getPostTypeBadge(service.type);
  const isSkillSwap = service.type === "skill_swap";

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareUrl = `https://swap-skills.com/services/${service.id}`;
    const shareTitle = service.title;
    const shareText = `Check out "${service.title}" on SwapSkills - Trade skills, not money! 🔄`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!", {
      description: "Share it on your favorite social media platform.",
    });
  };
  return <Link to={`/services/${service.id}`}>
      <Card className={cn("group overflow-hidden hover-lift cursor-pointer border-2 border-transparent hover:border-primary/20 bg-card transition-all duration-300", className)}>
        <CardContent className="p-5">
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

          {/* Description */}
          

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
                  {service.user.completedTrades > 0 && <>
                      {service.user.rating !== null && <span>·</span>}
                      <span>{service.user.completedTrades} swaps</span>
                    </>}
                </div>
              </div>
            </div>}

          {/* Actions */}
          <div className="flex justify-between items-center pt-3 border-t border-border mt-4">
            <Button
              variant="outline"
              size="sm"
              className="text-primary border-primary/30 hover:bg-primary/10 gap-1.5"
            >
              <span className="text-xs font-medium">Read more</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-muted-foreground hover:text-primary gap-1.5"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-xs">Share</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>;
}