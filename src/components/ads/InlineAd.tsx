import { useAds, getRandomAd, useUserLocation } from "@/hooks/useAds";
import { AdDisplay } from "./AdDisplay";
import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";

interface InlineAdProps {
  className?: string;
}

export function InlineAd({ className = "" }: InlineAdProps) {
  const { data: ads } = useAds("inline");
  const { data: userLocation } = useUserLocation();
  const { user } = useAuth();
  const isLoggedIn = !!user;
  
  const selectedAd = useMemo(() => getRandomAd(ads, userLocation, isLoggedIn), [ads, userLocation, isLoggedIn]);

  return (
    <div className={`xl:hidden px-4 py-6 flex justify-center ${className}`}>
      <div className="w-full max-w-md">
        <AdDisplay ad={selectedAd} variant="inline" />
      </div>
    </div>
  );
}
