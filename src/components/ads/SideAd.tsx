import { AdPlaceholder } from "./AdPlaceholder";

interface SideAdProps {
  position: "left" | "right";
  className?: string;
}

export function SideAd({ position, className = "" }: SideAdProps) {
  return (
    <div 
      className={`
        hidden xl:flex flex-col gap-4 w-[200px] flex-shrink-0 sticky top-24
        ${position === "left" ? "mr-4" : "ml-4"}
        ${className}
      `}
    >
      <AdPlaceholder variant="side" />
      <AdPlaceholder variant="side" />
    </div>
  );
}
