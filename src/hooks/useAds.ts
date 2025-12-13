import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Ad {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  placement: string;
  advertiser_id: string;
}

export function useAds(placement?: "side" | "inline" | "both") {
  return useQuery({
    queryKey: ["ads", placement],
    queryFn: async () => {
      let query = supabase
        .from("ads")
        .select("id, title, description, image_url, link_url, placement, advertiser_id")
        .eq("is_active", true)
        .or("ends_at.is.null,ends_at.gt.now()");

      if (placement && placement !== "both") {
        query = query.or(`placement.eq.${placement},placement.eq.both`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Ad[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get a random ad from the list
export function getRandomAd(ads: Ad[] | undefined): Ad | null {
  if (!ads || ads.length === 0) return null;
  return ads[Math.floor(Math.random() * ads.length)];
}
