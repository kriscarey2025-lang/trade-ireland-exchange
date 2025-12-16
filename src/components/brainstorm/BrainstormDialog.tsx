import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Lightbulb, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface SkillSwapIdea {
  title: string;
  description: string;
  yourOffer: string;
  yourNeed: string;
}

interface BrainstormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BrainstormDialog({ open, onOpenChange }: BrainstormDialogProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'input' | 'loading' | 'results'>('input');
  const [strengths, setStrengths] = useState("");
  const [needs, setNeeds] = useState("");
  const [ideas, setIdeas] = useState<SkillSwapIdea[]>([]);

  const handleGenerate = async () => {
    if (!strengths.trim() || !needs.trim()) {
      toast.error("Please fill in both fields");
      return;
    }

    setStep('loading');

    try {
      const { data, error } = await supabase.functions.invoke('brainstorm-skills', {
        body: { strengths, needs }
      });

      if (error) throw error;

      setIdeas(data.ideas || []);
      setStep('results');
    } catch (error) {
      console.error('Error generating ideas:', error);
      toast.error("Failed to generate ideas. Please try again.");
      setStep('input');
    }
  };

  const handleConvertToPost = (idea: SkillSwapIdea) => {
    // Navigate to new service page with pre-filled data
    const params = new URLSearchParams({
      title: idea.title,
      description: idea.description,
      fromBrainstorm: 'true'
    });
    navigate(`/services/new?${params.toString()}`);
    onOpenChange(false);
    resetDialog();
  };

  const resetDialog = () => {
    setStep('input');
    setStrengths("");
    setNeeds("");
    setIdeas([]);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetDialog();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="h-5 w-5 text-primary" />
            Brainstorm Skill Swap Ideas
          </DialogTitle>
          <DialogDescription>
            Tell us about your skills and needs, and we'll suggest creative skill swap opportunities.
          </DialogDescription>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="strengths" className="text-base font-medium flex items-center gap-2">
                <span className="text-lg">💪</span>
                What are you naturally good at?
              </Label>
              <p className="text-sm text-muted-foreground">
                Skills you love doing, talents, abilities that come easy to you
              </p>
              <Textarea
                id="strengths"
                placeholder="e.g., I'm great at graphic design, love cooking, good with spreadsheets, enjoy teaching kids..."
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="needs" className="text-base font-medium flex items-center gap-2">
                <span className="text-lg">🙏</span>
                What do you need help with?
              </Label>
              <p className="text-sm text-muted-foreground">
                Things you're not good at, tasks you avoid, skills you'd love to learn
              </p>
              <Textarea
                id="needs"
                placeholder="e.g., I'm terrible at DIY, never have time to clean, need help with my CV, want to learn guitar..."
                value={needs}
                onChange={(e) => setNeeds(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              className="w-full"
              disabled={!strengths.trim() || !needs.trim()}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Skill Swap Ideas
            </Button>
          </div>
        )}

        {step === 'loading' && (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Brainstorming creative ideas for you...</p>
          </div>
        )}

        {step === 'results' && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Here are some skill swap ideas based on your input:
              </p>
              <Button variant="ghost" size="sm" onClick={() => setStep('input')}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Try Again
              </Button>
            </div>

            <div className="space-y-4">
              {ideas.map((idea, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-xl border border-border bg-muted/30 space-y-3 hover:border-primary/50 transition-colors"
                >
                  <h4 className="font-semibold text-foreground">{idea.title}</h4>
                  <p className="text-sm text-muted-foreground">{idea.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                      You offer: {idea.yourOffer}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-accent/10 text-accent-foreground">
                      You get: {idea.yourNeed}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => handleConvertToPost(idea)}
                  >
                    Create Post from This Idea
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ))}
            </div>

            {ideas.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No ideas generated. Please try again with different inputs.</p>
                <Button variant="outline" className="mt-4" onClick={() => setStep('input')}>
                  Try Again
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
