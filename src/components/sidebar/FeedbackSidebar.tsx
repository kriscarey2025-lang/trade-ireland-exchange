import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Lightbulb, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import FeatureRequestDialog from "./FeatureRequestDialog";
import FeedbackDialog from "./FeedbackDialog";
import LeprechaunWizard from "./LeprechaunWizard";

const FeedbackSidebar = () => {
  const location = useLocation();
  const [featureDialogOpen, setFeatureDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  // Hide on business plan page
  if (location.pathname === "/business-plan") return null;

  return (
    <>
      <div className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 flex-col gap-2 p-2 bg-background/80 backdrop-blur-sm border-l border-t border-b rounded-l-xl shadow-lg">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all"
                onClick={() => setFeatureDialogOpen(true)}
              >
                <Lightbulb className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Request a Feature</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 hover:bg-secondary/50 hover:text-secondary-foreground transition-all"
                onClick={() => setFeedbackDialogOpen(true)}
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Send Feedback</p>
            </TooltipContent>
          </Tooltip>

          <div className="border-t border-border my-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all group"
                onClick={() => setWizardOpen(true)}
              >
                <span className="text-2xl group-hover:animate-bounce">🍀</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Ask Lucky the Leprechaun</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <FeatureRequestDialog open={featureDialogOpen} onOpenChange={setFeatureDialogOpen} />
      <FeedbackDialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen} />
      <LeprechaunWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </>
  );
};

export default FeedbackSidebar;
