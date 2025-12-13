import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Star, ArrowUpRight, Linkedin, Facebook, Instagram } from "lucide-react";
import { categoryLabels, categoryIcons } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { ServiceCategory } from "@/types";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";

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
}

interface ServiceData {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  type: "offer" | "request";
  location: string;
  estimatedHours?: number;
  creditValue?: number;
  user?: ServiceUser;
}

interface ServiceCardProps {
  service: ServiceData;
  className?: string;
}

export function ServiceCard({ service, className }: ServiceCardProps) {
  const isOffer = service.type === "offer";

  return (
    <Link to={`/services/${service.id}`}>
      <Card className={cn(
        "group overflow-hidden hover-lift cursor-pointer border-2 border-transparent hover:border-primary/20 bg-card transition-all duration-300",
        className
      )}>
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <Badge 
              variant={isOffer ? "default" : "accent"}
              className="shrink-0 rounded-lg"
            >
              {isOffer ? "✨ Offering" : "🔍 Looking for"}
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
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
            {service.description}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary text-xs font-medium text-secondary-foreground">
              <MapPin className="h-3 w-3" />
              {service.location}
            </div>
            {service.estimatedHours && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary text-xs font-medium text-secondary-foreground">
                <Clock className="h-3 w-3" />
                ~{service.estimatedHours}h
              </div>
            )}
          </div>

          {/* User */}
          {service.user && (
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <Avatar className="h-10 w-10 ring-2 ring-background shadow-md">
                <AvatarImage src={service.user.avatar} alt={service.user.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {service.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-sm truncate">
                    {service.user.name}
                  </span>
                  <VerifiedBadge 
                    status={service.user.verificationStatus} 
                    size="sm" 
                  />
                  {/* Social Media Icons */}
                  {(service.user.linkedinUrl || service.user.facebookUrl || service.user.instagramUrl) && (
                    <div className="flex items-center gap-1 ml-1">
                      {service.user.linkedinUrl && (
                        <Linkedin className="h-3.5 w-3.5 text-[#0A66C2] shrink-0" />
                      )}
                      {service.user.facebookUrl && (
                        <Facebook className="h-3.5 w-3.5 text-[#1877F2] shrink-0" />
                      )}
                      {service.user.instagramUrl && (
                        <Instagram className="h-3.5 w-3.5 text-[#E4405F] shrink-0" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {service.user.rating !== null ? (
                    <>
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      <span className="font-medium text-warning">{service.user.rating.toFixed(1)}</span>
                      <span>·</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground italic">No reviews</span>
                  )}
                  {service.user.completedTrades > 0 && (
                    <>
                      {service.user.rating !== null && <span>·</span>}
                      <span>{service.user.completedTrades} swaps</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}