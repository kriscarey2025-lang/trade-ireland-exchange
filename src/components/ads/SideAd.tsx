import { useAds, getRandomAd, useUserLocation } from "@/hooks/useAds";
import { AdDisplay } from "./AdDisplay";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

interface SideAdProps {
  position: "left" | "right";
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

export function SideAd({ position, className = "" }: SideAdProps) {
  const { data: ads, isLoading } = useAds("side");
  const { data: userLocation } = useUserLocation();
  const { user } = useAuth();
  const isLoggedIn = !!user;
  
  const [selectedAds, setSelectedAds] = useState<[Ad | null, Ad | null]>([null, null]);
  const hasInitialized = useRef(false);
  
  // Select ads when data first arrives or on rotation
  const selectAds = () => {
    if (!ads || ads.length === 0) {
      setSelectedAds([null, null]);
      return;
    }
    
    const firstAd = getRandomAd(ads, userLocation, isLoggedIn);
    const remainingAds = ads.filter(ad => ad.id !== firstAd?.id);
    const secondAd = remainingAds.length > 0 ? getRandomAd(remainingAds, userLocation, isLoggedIn) : null;
    
    setSelectedAds([firstAd, secondAd]);
  };
  
  // Initialize ads when data first arrives
  useEffect(() => {
    if (ads && ads.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      selectAds();
    }
  }, [ads, userLocation, isLoggedIn]);
  
  // Auto-rotate ads every 30 seconds
  useEffect(() => {
    if (!ads || ads.length === 0) return;
    
    const interval = setInterval(() => {
      selectAds();
    }, AD_ROTATION_INTERVAL);
    
    return () => clearInterval(interval);
  }, [ads, userLocation, isLoggedIn]);

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
