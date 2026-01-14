import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, Zap, Clock, Linkedin, Facebook, Instagram } from "lucide-react";
import { categoryLabels, categoryIcons } from "@/lib/categories";
import { cn, formatDisplayName } from "@/lib/utils";
import { ServiceCategory, PostCategory } from "@/types";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import { FoundersBadge } from "@/components/profile/FoundersBadge";
import { format, isToday, isTomorrow, differenceInDays, formatDistanceToNow } from "date-fns";

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
  isTimeSensitive?: boolean;
  neededByDate?: Date | null;
  createdAt?: Date;
  completedSwapsCount?: number;
  user?: ServiceUser;
}

interface ServiceCardCompactProps {
  service: ServiceData;
  className?: string;
}

const getPostTypeLabel = (type: PostCategory) => {
  switch (type) {
    case "free_offer":
      return "🎁";
    case "help_request":
      return "🙋";
    case "skill_swap":
      return "🔄";
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

export function ServiceCardCompact({ service, className }: ServiceCardCompactProps) {
  const neededByLabel = getNeededByLabel(service.neededByDate, service.isTimeSensitive);
  const hasImage = service.images && service.images.length > 0 && service.images[0];

  return (
    <Link 
      to={`/services/${service.id}`} 
      className={cn(
        "flex items-center gap-3 p-3 bg-card border rounded-lg",
        service.isTimeSensitive 
          ? "border-orange-400 dark:border-orange-500" 
          : "border-border",
        className
      )}
    >
      {/* Image or Avatar */}
      {hasImage ? (
        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-muted">
          <img 
            src={service.images![0]} 
            alt={service.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : service.user ? (
        <Avatar className="w-14 h-14 shrink-0">
          <AvatarImage src={service.user.avatar} alt={service.user.name} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {service.user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <span className="text-2xl">{categoryIcons[service.category]}</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-sm">{getPostTypeLabel(service.type)}</span>
          <h3 className="font-medium text-sm line-clamp-1 flex-1">{service.title}</h3>
          {service.isTimeSensitive && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 shrink-0">
              <Zap className="h-2.5 w-2.5 mr-0.5" />
              {neededByLabel}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {service.location}
          </span>
          <span>·</span>
          <span>{categoryLabels[service.category]}</span>
          {service.createdAt && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(service.createdAt, { addSuffix: false }).replace('about ', '')}
              </span>
            </>
          )}
          {service.user && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                {formatDisplayName(service.user.name).split(' ')[0]}
                <VerifiedBadge status={service.user.verificationStatus} size="sm" />
                {service.user.isFounder && <FoundersBadge size="sm" />}
                {/* Social Media Icons */}
                {(service.user.linkedinUrl || service.user.facebookUrl || service.user.instagramUrl) && (
                  <>
                    {service.user.linkedinUrl && (
                      <a 
                        href={service.user.linkedinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="hover:opacity-70 transition-opacity"
                      >
                        <Linkedin className="h-3 w-3 text-[#0A66C2]" />
                      </a>
                    )}
                    {service.user.facebookUrl && (
                      <a 
                        href={service.user.facebookUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="hover:opacity-70 transition-opacity"
                      >
                        <Facebook className="h-3 w-3 text-[#1877F2]" />
                      </a>
                    )}
                    {service.user.instagramUrl && (
                      <a 
                        href={service.user.instagramUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="hover:opacity-70 transition-opacity"
                      >
                        <Instagram className="h-3 w-3 text-[#E4405F]" />
                      </a>
                    )}
                  </>
                )}
                {service.user.rating !== null && (
                  <span className="flex items-center gap-0.5 text-warning">
                    <Star className="h-2.5 w-2.5 fill-current" />
                    {service.user.rating.toFixed(1)}
                  </span>
                )}
                {(service.completedSwapsCount ?? 0) > 0 && (
                  <span className="text-primary font-medium">
                    {service.completedSwapsCount} ✓
                  </span>
                )}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
