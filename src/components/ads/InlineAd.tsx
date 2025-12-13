import { AdPlaceholder } from "./AdPlaceholder";

interface InlineAdProps {
  className?: string;
}

export function InlineAd({ className = "" }: InlineAdProps) {
  return (
    <div className={`xl:hidden px-4 py-6 ${className}`}>
      <div className="max-w-md mx-auto">
        <AdPlaceholder variant="inline" />
      </div>
    </div>
  );
}
