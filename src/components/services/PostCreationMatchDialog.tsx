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
      // Close the dialog and navigate to AI Matches page
      onOpenChange(false);
      
      toast.success("Skill posted! 🎉", {
        description: "Finding people who want your skill...",
      });
      
      // Navigate to AI Matches page with a flag to highlight new matches
      navigate("/ai-matches", { 
        state: { 
          newServiceCategory,
          newServiceTitle,
          showNewMatches: true 
        } 
      });
    }
  }, [open, onOpenChange, navigate, newServiceCategory, newServiceTitle]);

  // This component no longer renders anything - it just handles navigation
  return null;
}
