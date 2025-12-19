import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Ad {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  placement: string;
  advertiser_id: string;
  advertiser_location?: string | null;
}

export function useAds(placement?: "side" | "inline" | "both") {
  const { user } = useAuth();

  // Fetch user's location
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile-location", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("location")
        .eq("id", user.id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return useQuery({
    queryKey: ["ads", placement, userProfile?.location],
    queryFn: async () => {
      let query = supabase
        .from("ads")
        .select(`
          id, title, description, image_url, link_url, placement, advertiser_id,
          advertisers!inner(location)
        `)
        .eq("is_active", true)
        .eq("approved", true)
        .or("ends_at.is.null,ends_at.gt.now()");

      if (placement && placement !== "both") {
        query = query.or(`placement.eq.${placement},placement.eq.both`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform data to include advertiser location
      const adsWithLocation = (data || []).map((ad: any) => ({
        id: ad.id,
        title: ad.title,
        description: ad.description,
        image_url: ad.image_url,
        link_url: ad.link_url,
        placement: ad.placement,
        advertiser_id: ad.advertiser_id,
        advertiser_location: ad.advertisers?.location,
      }));

      return adsWithLocation as Ad[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get a random ad with location-based filtering
// - Non-logged-in users: rotate all active ads equally
// - Logged-in users: show ONLY ads matching their county/location
export function getRandomAd(ads: Ad[] | undefined, userLocation?: string | null, isLoggedIn?: boolean): Ad | null {
  if (!ads || ads.length === 0) return null;
  
  // If user is logged in and has a location, show ONLY matching ads
  if (isLoggedIn && userLocation) {
    const normalizedUserLocation = userLocation.toLowerCase().trim();
    
    // Filter to only location-matched ads
    const matchedAds = ads.filter(ad => 
      ad.advertiser_location?.toLowerCase().trim() === normalizedUserLocation
    );
    
    // If no matching ads, show nothing for logged-in users
    if (matchedAds.length === 0) return null;
    
    return matchedAds[Math.floor(Math.random() * matchedAds.length)];
  }
  
  // Non-logged-in users OR logged-in without location: rotate all ads equally
  return ads[Math.floor(Math.random() * ads.length)];
}

// Hook to get user location for ad components
export function useUserLocation() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["user-location-for-ads", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("location")
        .eq("id", user.id)
        .single();
      return data?.location || null;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });
}
