import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ServiceCardSkeleton() {
  return (
    <Card className="overflow-hidden border-[3px] border-primary/20 bg-card h-full flex flex-col">
      {/* Image skeleton */}
      <Skeleton className="w-full aspect-[16/10] sm:aspect-[16/9]" />
      
      <CardContent className="p-4 sm:p-5 flex-1 flex flex-col pt-3 sm:pt-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-6 w-8 rounded-lg" />
        </div>

        {/* Title */}
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-3/4 mb-4" />

        {/* Meta Info */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          <Skeleton className="h-7 w-20 rounded-lg" />
          <Skeleton className="h-7 w-14 rounded-lg" />
        </div>

        {/* User section */}
        <div className="flex items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-border">
          <Skeleton className="h-10 w-10 sm:h-14 sm:w-14 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-border mt-auto">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-7 w-20 rounded-md" />
            <Skeleton className="h-7 w-24 rounded-md" />
          </div>
          <Skeleton className="h-7 w-16 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
