import { ReactNode } from "react";
import { SideAd } from "../ads/SideAd";

interface AdsLayoutProps {
  children: ReactNode;
}

export function AdsLayout({ children }: AdsLayoutProps) {
  return (
    <div className="flex justify-center w-full">
      <SideAd position="left" />
      <div className="flex-1 max-w-7xl min-w-0">
        {children}
      </div>
      <SideAd position="right" />
    </div>
  );
}
