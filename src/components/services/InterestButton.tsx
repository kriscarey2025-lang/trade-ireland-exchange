import { useState } from "react";
import { Heart, HeartOff, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useInterests, useExpressInterest, useRemoveInterest } from "@/hooks/useInterests";
import { useNavigate } from "react-router-dom";
import { ContactDialog } from "@/components/messaging/ContactDialog";
import { supabase } from "@/integrations/supabase/client";

interface InterestButtonProps {
  serviceId: string;
  serviceTitle?: string;
  ownerId?: string | null;
  ownerName?: string | null;
  className?: string;
}

export function InterestButton({ serviceId, serviceTitle, ownerId, ownerName, className }: InterestButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: existingInterest, isLoading } = useInterests(serviceId);
  const expressInterest = useExpressInterest();
  const removeInterest = useRemoveInterest();
  const [showContactDialog, setShowContactDialog] = useState(false);

  // Don't show button for own services
  if (user && ownerId && user.id === ownerId) {
    return null;
  }

  const handleClick = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (existingInterest) {
      removeInterest.mutate(serviceId);
    } else {
      // Express interest AND immediately open message dialog
      expressInterest.mutate({ serviceId, serviceTitle });
      setShowContactDialog(true);
    }
  };

  const isPending = expressInterest.isPending || removeInterest.isPending;

  return (
    <>
      <Button
        variant={existingInterest ? "secondary" : "outline"}
        onClick={handleClick}
        disabled={isPending || isLoading}
        className={className}
      >
        {isPending || isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : existingInterest ? (
          <HeartOff className="h-4 w-4 mr-2" />
        ) : (
          <MessageCircle className="h-4 w-4 mr-2" />
        )}
        {existingInterest ? "Not Interested" : "Message & Swap"}
      </Button>

      {ownerId && (
        <ContactDialog
          open={showContactDialog}
          onOpenChange={setShowContactDialog}
          serviceId={serviceId}
          serviceTitle={serviceTitle || "this service"}
          providerId={ownerId}
          providerName={ownerName || "this person"}
        />
      )}
    </>
  );
}
