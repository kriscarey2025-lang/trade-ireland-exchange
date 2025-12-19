import { useAds, getRandomAd, useUserLocation } from "@/hooks/useAds";
import { AdDisplay } from "./AdDisplay";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface InlineAdProps {
  className?: string;
}

const AD_ROTATION_INTERVAL = 30000; // 30 seconds

export function InlineAd({ className = "" }: InlineAdProps) {
  const { data: ads } = useAds("inline");
  const { data: userLocation } = useUserLocation();
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const [rotationKey, setRotationKey] = useState(0);
  
  // Auto-rotate ads every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRotationKey(prev => prev + 1);
    }, AD_ROTATION_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);
  
  const selectedAd = useMemo(() => getRandomAd(ads, userLocation, isLoggedIn), [ads, userLocation, isLoggedIn, rotationKey]);

  return (
    <div className={`xl:hidden px-4 py-6 flex justify-center ${className}`}>
      <div className="w-full max-w-md">
        <AdDisplay ad={selectedAd} variant="inline" />
      </div>
    </div>
  );
}
