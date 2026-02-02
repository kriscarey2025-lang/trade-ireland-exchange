import { Loader2 } from "lucide-react";

export function PageLoader() {
  return (
    <div 
      className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-background"
      role="status"
      aria-label="Loading page"
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
