import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Users, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceCardMobile } from "@/components/services/ServiceCardMobile";
import { ServiceCardCompact } from "@/components/services/ServiceCardCompact";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

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
  category: string;
  type: string;
  location: string;
  images?: string[];
  acceptedCategories?: string[];
  isTimeSensitive?: boolean;
  neededByDate?: Date | null;
  user?: ServiceUser;
}

interface LocalOffersSectionProps {
  services: ServiceData[];
  isLoading: boolean;
  userLocation?: string;
}

export function LocalOffersSection({ services, isLoading, userLocation }: LocalOffersSectionProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [profileLocation, setProfileLocation] = useState<string | null>(null);

  // Fetch user's location from their profile if logged in
  useEffect(() => {
    const fetchUserLocation = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from("profiles")
        .select("location")
        .eq("id", user.id)
        .maybeSingle();
      
      if (data?.location) {
        setProfileLocation(data.location);
      }
    };
    
    fetchUserLocation();
  }, [user?.id]);

  // Get the location to use for filtering
  const effectiveLocation = userLocation || profileLocation;

  // Filter services by location and get recent ones
  const localServices = useMemo(() => {
    if (!effectiveLocation) return [];
    
    return services
      .filter(service => {
        const serviceLocation = service.location?.toLowerCase() || "";
        const targetLocation = effectiveLocation.toLowerCase();
        return serviceLocation.includes(targetLocation) || targetLocation.includes(serviceLocation);
      })
      .slice(0, 8); // Show max 8
  }, [services, effectiveLocation]);

  // If no location or no local services, don't show this section
  if (isLoading || !effectiveLocation || localServices.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              People near you
              <span className="text-primary">in {effectiveLocation}</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              {localServices.length} local {localServices.length === 1 ? "offer" : "offers"} available
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid - Horizontal scroll on mobile */}
      {isMobile ? (
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {localServices.map((service) => (
            <div key={service.id} className="min-w-[160px] max-w-[160px] snap-start">
              <ServiceCardMobile service={service as any} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {localServices.map((service) => (
            <ServiceCardCompact key={service.id} service={service as any} />
          ))}
        </div>
      )}

      {/* Divider with message */}
      <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-center">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>Browse all services across Ireland below</span>
          <ArrowRight className="h-4 w-4" />
        </p>
      </div>
    </section>
  );
}
