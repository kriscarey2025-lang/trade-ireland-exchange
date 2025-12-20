import { Heart, HeartOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useInterests, useExpressInterest, useRemoveInterest } from "@/hooks/useInterests";
import { useNavigate } from "react-router-dom";

interface InterestButtonProps {
  serviceId: string;
  ownerId?: string | null;
  className?: string;
}

export function InterestButton({ serviceId, ownerId, className }: InterestButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: existingInterest, isLoading } = useInterests(serviceId);
  const expressInterest = useExpressInterest();
  const removeInterest = useRemoveInterest();

  // Don't show button for own services
  if (user && ownerId && user.id === ownerId) {
    return null;
  }

  const handleClick = () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (existingInterest) {
      removeInterest.mutate(serviceId);
    } else {
      expressInterest.mutate(serviceId);
    }
  };

  const isPending = expressInterest.isPending || removeInterest.isPending;

  return (
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
        <Heart className="h-4 w-4 mr-2" />
      )}
      {existingInterest ? "Not Interested" : "I'm Interested"}
    </Button>
  );
}
