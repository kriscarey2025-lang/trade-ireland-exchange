import { useAds, getRandomAd, useUserLocation } from "@/hooks/useAds";
import { AdDisplay } from "./AdDisplay";
import { useMemo } from "react";

interface SideAdProps {
  position: "left" | "right";
  className?: string;
}

export function SideAd({ position, className = "" }: SideAdProps) {
  const { data: ads } = useAds("side");
  const { data: userLocation } = useUserLocation();
  
  // Get two random ads for the side slots with location prioritization
  const selectedAds = useMemo(() => {
    if (!ads || ads.length === 0) return [null, null];
    
    // Get first ad with location priority
    const firstAd = getRandomAd(ads, userLocation);
    
    // Get second ad from remaining (if any)
    const remainingAds = ads.filter(ad => ad.id !== firstAd?.id);
    const secondAd = remainingAds.length > 0 ? getRandomAd(remainingAds, userLocation) : null;
    
    return [firstAd, secondAd];
  }, [ads, userLocation]);

  return (
    <div 
      className={`
        hidden xl:flex flex-col gap-3 w-[160px] flex-shrink-0 sticky top-24 mt-32
        ${position === "left" ? "mr-3" : "ml-3"}
        ${className}
      `}
    >
      <AdDisplay ad={selectedAds[0]} variant="side" />
      {selectedAds[1] && <AdDisplay ad={selectedAds[1]} variant="side" />}
    </div>
  );
}
