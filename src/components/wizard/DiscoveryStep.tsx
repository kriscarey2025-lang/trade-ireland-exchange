import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MapPin, ArrowRight, ArrowLeft, Sparkles, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { categoryLabels, categoryIcons } from "@/lib/categories";
import { toast } from "sonner";
import { cn, formatDisplayName } from "@/lib/utils";

interface LocalService {
  id: string;
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  type: string;
  provider_name: string | null;
  provider_avatar: string | null;
  user_id: string;
}

interface DiscoveryStepProps {
  onComplete: () => void;
  userLocation?: string;
}

const ITEMS_PER_PAGE = 6;
const MAX_PAGES = 1;

export function DiscoveryStep({ onComplete, userLocation }: DiscoveryStepProps) {
  const { user } = useAuth();
  const [allServices, setAllServices] = useState<LocalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedServices, setLikedServices] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchLocalServices();
  }, [userLocation]);

  const fetchLocalServices = async () => {
    setLoading(true);
    try {
      // Fetch services, prioritizing user's location if available
      const { data, error } = await supabase.rpc("get_public_services", {
        _status: "active",
        _location: userLocation || null,
      });

      if (error) throw error;

      // Filter out user's own services and limit to 12 (2 pages of 6)
      const filteredServices = (data || [])
        .filter((s: LocalService) => s.user_id !== user?.id)
        .slice(0, ITEMS_PER_PAGE * MAX_PAGES);

      setAllServices(filteredServices);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get services for current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const services = allServices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(allServices.length / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;

  const toggleLike = (serviceId: string) => {
    setLikedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  const handleContinue = async () => {
    if (!user) return;

    setSubmitting(true);

    try {
      // Save all liked services as interests
      if (likedServices.size > 0) {
        const interests = Array.from(likedServices).map(serviceId => ({
          user_id: user.id,
          service_id: serviceId,
        }));

        const { error } = await supabase
          .from("interests")
          .upsert(interests, { onConflict: "user_id,service_id" });

        if (error) throw error;

        toast.success(`You liked ${likedServices.size} listing${likedServices.size > 1 ? "s" : ""}! They'll be notified.`);
      }

      onComplete();
    } catch (error) {
      console.error("Error saving interests:", error);
      // Continue anyway - don't block the flow
      onComplete();
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "skill_swap": return "Swap";
      case "free_offer": return "Free";
      case "help_request": return "Help Needed";
      default: return type;
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case "skill_swap": return "bg-primary/10 text-primary border-primary/20";
      case "free_offer": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      case "help_request": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">See what's available! 👀</h2>
        <p className="text-muted-foreground">
          Heart the listings that interest you — we'll let them know!
        </p>
        
        {/* Guidance banner */}
        <div className="mt-4 mx-auto max-w-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            💛 <span className="font-medium">No commitment!</span> Hearting just lets them know you're interested in swapping — you can chat first before deciding.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
          {userLocation && (
            <Badge variant="outline">
              <MapPin className="h-3 w-3 mr-1" />
              Near {userLocation}
            </Badge>
          )}
          {totalPages > 1 && (
            <Badge variant="secondary">
              Page {currentPage} of {totalPages}
            </Badge>
          )}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : allServices.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-xl">
          <p className="text-muted-foreground">
            No listings in your area yet — be the first to post!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map((service) => {
            const isLiked = likedServices.has(service.id);
            const IconComponent = categoryIcons[service.category as keyof typeof categoryIcons];

            return (
              <Card
                key={service.id}
                className={cn(
                  "relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md",
                  isLiked && "ring-2 ring-rose-400 bg-rose-50/50 dark:bg-rose-900/10"
                )}
                onClick={() => toggleLike(service.id)}
              >
                <CardContent className="p-4">
                  {/* Heart button */}
                  <button
                    className={cn(
                      "absolute top-3 right-3 p-2 rounded-full transition-all duration-200",
                      isLiked
                        ? "bg-rose-100 dark:bg-rose-900/40"
                        : "bg-muted/50 hover:bg-muted"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(service.id);
                    }}
                  >
                    <Heart
                      className={cn(
                        "h-5 w-5 transition-all duration-200",
                        isLiked
                          ? "fill-rose-500 text-rose-500 scale-110"
                          : "text-muted-foreground"
                      )}
                    />
                  </button>

                  {/* Type badge */}
                  <Badge
                    variant="outline"
                    className={cn("text-xs mb-2", getTypeBadgeClass(service.type))}
                  >
                    {getTypeLabel(service.type)}
                  </Badge>

                  {/* Title */}
                  <h3 className="font-semibold text-sm line-clamp-2 pr-10 mb-2">
                    {service.title}
                  </h3>

                  {/* Category & Location */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {IconComponent && <span>{categoryIcons[service.category as keyof typeof categoryIcons]}</span>}
                    <span>{categoryLabels[service.category as keyof typeof categoryLabels] || service.category}</span>
                    {service.location && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="h-3 w-3" />
                          {service.location}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Provider */}
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
                    {service.provider_avatar ? (
                      <img
                        src={service.provider_avatar}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground truncate">
                      {formatDisplayName(service.provider_name)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Liked count */}
      {likedServices.size > 0 && (
        <div className="text-center">
          <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800">
            <Heart className="h-3 w-3 mr-1 fill-current" />
            {likedServices.size} liked
          </Badge>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-4">
        {hasNextPage ? (
          <>
            <Button
              variant="hero"
              className="w-full"
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              See More Listings
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={handleContinue}
              disabled={submitting}
            >
              {submitting ? "Saving..." : likedServices.size > 0 ? "Skip to next step" : "Skip & Continue"}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="hero"
              className="w-full"
              onClick={handleContinue}
              disabled={submitting}
            >
              {submitting ? (
                "Saving..."
              ) : likedServices.size > 0 ? (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Skip & Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            {currentPage > 1 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Page {currentPage - 1}
              </Button>
            )}
          </>
        )}

        {services.length > 0 && likedServices.size === 0 && (
          <p className="text-xs text-center text-muted-foreground">
            💡 Tip: Tap listings to heart them and connect with their owners
          </p>
        )}
      </div>
    </div>
  );
}
