import { useAds, getRandomAd } from "@/hooks/useAds";
import { AdDisplay } from "./AdDisplay";
import { useMemo } from "react";

interface SideAdProps {
  position: "left" | "right";
  className?: string;
}

export function SideAd({ position, className = "" }: SideAdProps) {
  const { data: ads } = useAds("side");
  
  // Get two random ads for the side slots
  const selectedAds = useMemo(() => {
    if (!ads || ads.length === 0) return [null, null];
    
    const shuffled = [...ads].sort(() => Math.random() - 0.5);
    return [shuffled[0] || null, shuffled[1] || null];
  }, [ads]);

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
