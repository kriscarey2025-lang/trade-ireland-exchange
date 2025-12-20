import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import { FoundersBadge } from "@/components/profile/FoundersBadge";

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
}

export function AIMatchCard({ match }: AIMatchCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500/20 text-green-700 border-green-500/30";
    if (score >= 60) return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
    return "bg-orange-500/20 text-orange-700 border-orange-500/30";
  };

  const formatDisplayName = (fullName: string | null | undefined): string => {
    if (!fullName) return 'Anonymous';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${firstName} ${lastInitial}.`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50">
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
                <h3 className="font-semibold text-lg line-clamp-1">{match.service.title}</h3>
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
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={match.provider?.avatar_url} />
                  <AvatarFallback>
                    {match.provider?.full_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">{formatDisplayName(match.provider?.full_name)}</span>
                  {match.provider?.verification_status === 'verified' && (
                    <VerifiedBadge status="verified" size="sm" />
                  )}
                  {match.provider?.is_founder && (
                    <FoundersBadge size="sm" />
                  )}
                </div>
                {match.service.location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {match.service.location}
                  </div>
                )}
              </div>
              <Button asChild size="sm">
                <Link to={`/services/${match.service.id}`}>
                  View
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
