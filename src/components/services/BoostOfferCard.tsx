import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Eye, BarChart3, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BoostOfferCardProps {
  serviceId: string;
  onDismiss: () => void;
}

export function BoostOfferCard({ serviceId, onDismiss }: BoostOfferCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBoost = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-boost-checkout", {
        body: { serviceId },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout");
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-2 border-amber-400/50 bg-gradient-to-br from-amber-50/80 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-lg mb-1">
              Your post is live! 🎉 Want to give it a boost?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get more eyes on your listing for 30 days — just €5, one-off.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Pinned to top</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Highlighted card</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Weekly stats</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleBoost}
                disabled={isLoading}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Boost for €5
              </Button>
              <Button
                variant="ghost"
                onClick={onDismiss}
                className="text-muted-foreground"
              >
                No thanks, I'm good
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
