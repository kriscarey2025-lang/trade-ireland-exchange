import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DiscoveryStep } from "@/components/wizard/DiscoveryStep";
import { useNavigate } from "react-router-dom";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface PostCreationMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newServiceId: string;
  newServiceTitle: string;
  newServiceCategory: string;
  userId: string;
  userLocation?: string;
}

export function PostCreationMatchDialog({
  open,
  onOpenChange,
  newServiceTitle,
  userLocation,
}: PostCreationMatchDialogProps) {
  const navigate = useNavigate();

  const handleComplete = () => {
    onOpenChange(false);
    navigate("/browse");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Discover listings after posting "{newServiceTitle}"</DialogTitle>
        </VisuallyHidden>
        <DiscoveryStep onComplete={handleComplete} userLocation={userLocation} />
      </DialogContent>
    </Dialog>
  );
}
