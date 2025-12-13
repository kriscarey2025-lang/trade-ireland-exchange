import { useAds, getRandomAd } from "@/hooks/useAds";
import { AdDisplay } from "./AdDisplay";
import { useMemo } from "react";

interface InlineAdProps {
  className?: string;
}

export function InlineAd({ className = "" }: InlineAdProps) {
  const { data: ads } = useAds("inline");
  
  const selectedAd = useMemo(() => getRandomAd(ads), [ads]);

  return (
    <div className={`xl:hidden px-4 py-6 ${className}`}>
      <div className="max-w-md mx-auto">
        <AdDisplay ad={selectedAd} variant="inline" />
      </div>
    </div>
  );
}
