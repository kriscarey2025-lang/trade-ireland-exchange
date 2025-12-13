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
        hidden xl:flex flex-col gap-4 w-[200px] flex-shrink-0 sticky top-24
        ${position === "left" ? "mr-4" : "ml-4"}
        ${className}
      `}
    >
      <AdDisplay ad={selectedAds[0]} variant="side" />
      <AdDisplay ad={selectedAds[1]} variant="side" />
    </div>
  );
}
