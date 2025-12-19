import { useAds, getRandomAd, useUserLocation } from "@/hooks/useAds";
import { AdDisplay } from "./AdDisplay";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

interface InlineAdProps {
  className?: string;
}

const AD_ROTATION_INTERVAL = 30000; // 30 seconds

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

export function InlineAd({ className = "" }: InlineAdProps) {
  const { data: ads } = useAds("inline");
  const { data: userLocation } = useUserLocation();
  const { user } = useAuth();
  const isLoggedIn = !!user;
  
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const hasInitialized = useRef(false);
  
  // Select ad when data first arrives or on rotation
  const selectAd = () => {
    if (!ads || ads.length === 0) {
      setSelectedAd(null);
      return;
    }
    setSelectedAd(getRandomAd(ads, userLocation, isLoggedIn));
  };
  
  // Initialize ad when data first arrives
  useEffect(() => {
    if (ads && ads.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      selectAd();
    }
  }, [ads, userLocation, isLoggedIn]);
  
  // Auto-rotate ads every 30 seconds
  useEffect(() => {
    if (!ads || ads.length === 0) return;
    
    const interval = setInterval(() => {
      selectAd();
    }, AD_ROTATION_INTERVAL);
    
    return () => clearInterval(interval);
  }, [ads, userLocation, isLoggedIn]);

  return (
    <div className={`xl:hidden px-4 py-6 flex justify-center ${className}`}>
      <div className="w-full max-w-md">
        <AdDisplay ad={selectedAd} variant="inline" />
      </div>
    </div>
  );
}
