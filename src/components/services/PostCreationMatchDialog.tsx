import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface PostCreationMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newServiceId: string;
  newServiceTitle: string;
  newServiceCategory: string;
  userId: string;
}

export function PostCreationMatchDialog({
  open,
  onOpenChange,
  newServiceId,
  newServiceTitle,
  newServiceCategory,
  userId,
}: PostCreationMatchDialogProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      // Close the dialog
      onOpenChange(false);
      
      toast.success("Skill posted! 🎉", {
        description: "Finding people who want your skill...",
      });
      
      // Navigate to AI Matches page with boost offer flag
      navigate("/matches", { 
        state: { 
          newServiceCategory,
          newServiceTitle,
          showNewMatches: true,
          showBoostOffer: true,
          boostServiceId: newServiceId,
        } 
      });
    }
  }, [open, onOpenChange, navigate, newServiceCategory, newServiceTitle, newServiceId]);

  // This component no longer renders anything - it just handles navigation
  return null;
}
