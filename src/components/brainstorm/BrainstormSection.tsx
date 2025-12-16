import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Lightbulb, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export interface SkillSwapIdea {
  title: string;
  description: string;
  yourOffer: string;
  yourNeed: string;
}

const BRAINSTORM_STORAGE_KEY = 'brainstorm_progress';

export function BrainstormSection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [step, setStep] = useState<'input' | 'loading' | 'results'>('input');
  const [strengths, setStrengths] = useState("");
  const [needs, setNeeds] = useState("");
  const [ideas, setIdeas] = useState<SkillSwapIdea[]>([]);
  const [pendingIdea, setPendingIdea] = useState<SkillSwapIdea | null>(null);

  // Load saved progress on mount and handle post-auth redirect
  useEffect(() => {
    const saved = localStorage.getItem(BRAINSTORM_STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.strengths) setStrengths(data.strengths);
        if (data.needs) setNeeds(data.needs);
        if (data.ideas && data.ideas.length > 0) {
          setIdeas(data.ideas);
          setStep('results');
        }
        // Check if user just logged in and had a pending idea
        if (data.selectedIdea && user && searchParams.get('action') === 'brainstorm') {
          setPendingIdea(data.selectedIdea);
        }
      } catch (e) {
        console.error('Failed to load brainstorm progress:', e);
      }
    }
  }, [user, searchParams]);

  // Handle pending idea after login
  useEffect(() => {
    if (pendingIdea && user) {
      toast.success("Welcome back! Ready to create your post.");
      // Clear the pending state but keep the ideas visible
      const saved = localStorage.getItem(BRAINSTORM_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        delete data.selectedIdea;
        localStorage.setItem(BRAINSTORM_STORAGE_KEY, JSON.stringify(data));
      }
      setPendingIdea(null);
    }
  }, [pendingIdea, user]);

  // Save progress whenever it changes
  useEffect(() => {
    if (strengths || needs || ideas.length > 0) {
      localStorage.setItem(BRAINSTORM_STORAGE_KEY, JSON.stringify({
        strengths,
        needs,
        ideas,
        timestamp: Date.now()
      }));
    }
  }, [strengths, needs, ideas]);

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

      const generatedIdeas = data.ideas || [];
      setIdeas(generatedIdeas);
      setStep('results');
    } catch (error) {
      console.error('Error generating ideas:', error);
      toast.error("Failed to generate ideas. Please try again.");
      setStep('input');
    }
  };

  const handleConvertToPost = (idea: SkillSwapIdea) => {
    // Check if user is logged in
    if (!user) {
      // Save the idea they want to convert
      localStorage.setItem(BRAINSTORM_STORAGE_KEY, JSON.stringify({
        strengths,
        needs,
        ideas,
        selectedIdea: idea,
        timestamp: Date.now()
      }));
      
      toast.info("Please sign in to create a post");
      // Redirect to auth with return URL
      navigate('/auth?redirect=/matches&action=brainstorm');
      return;
    }

    // Navigate to new service page with pre-filled data
    const params = new URLSearchParams({
      title: idea.title,
      description: idea.description,
      fromBrainstorm: 'true'
    });
    navigate(`/services/new?${params.toString()}`);
    clearProgress();
  };

  const clearProgress = () => {
    localStorage.removeItem(BRAINSTORM_STORAGE_KEY);
    setStep('input');
    setStrengths("");
    setNeeds("");
    setIdeas([]);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-full bg-primary/10">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Brainstorm Corner</h3>
            <p className="text-sm text-muted-foreground">
              Not sure what to swap? Let AI help you discover opportunities.
            </p>
          </div>
        </div>

        {step === 'input' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="strengths-section" className="text-sm font-medium flex items-center gap-2">
                <span>💪</span>
                What are you naturally good at?
              </Label>
              <Textarea
                id="strengths-section"
                placeholder="e.g., I'm great at graphic design, love cooking, good with spreadsheets..."
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                className="min-h-[80px] resize-none bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="needs-section" className="text-sm font-medium flex items-center gap-2">
                <span>🙏</span>
                What do you need help with?
              </Label>
              <Textarea
                id="needs-section"
                placeholder="e.g., I'm terrible at DIY, need help with my CV, want to learn guitar..."
                value={needs}
                onChange={(e) => setNeeds(e.target.value)}
                className="min-h-[80px] resize-none bg-background"
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
          <div className="py-8 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Brainstorming creative ideas...</p>
          </div>
        )}

        {step === 'results' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Ideas based on your input:
              </p>
              <Button variant="ghost" size="sm" onClick={() => setStep('input')}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>

            <div className="space-y-3">
              {ideas.map((idea, index) => (
                <div 
                  key={index}
                  className="p-3 rounded-lg border border-border bg-background space-y-2 hover:border-primary/50 transition-colors"
                >
                  <h4 className="font-medium text-sm">{idea.title}</h4>
                  <p className="text-xs text-muted-foreground">{idea.description}</p>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      Offer: {idea.yourOffer}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground">
                      Get: {idea.yourNeed}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-1"
                    onClick={() => handleConvertToPost(idea)}
                  >
                    {user ? 'Create Post' : 'Sign In to Post'}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>

            {ideas.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-muted-foreground text-xs"
                onClick={clearProgress}
              >
                Clear & Start Over
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
