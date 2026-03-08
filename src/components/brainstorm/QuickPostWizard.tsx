import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, ArrowLeft, Loader2, Check, Pencil, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useContentModeration } from "@/hooks/useContentModeration";
import { categoryLabels } from "@/lib/categories";
import { ServiceCategory } from "@/types";
import { fireConfetti } from "@/hooks/useConfetti";
import { trackServiceCreated } from "@/hooks/useEngagementTracking";

interface GeneratedPost {
  title: string;
  description: string;
  category: string;
  offerSummary: string;
  needSummary: string;
}

const WIZARD_STORAGE_KEY = 'quick_post_wizard_progress';

const steps = [
  { label: "Your strengths", emoji: "💪" },
  { label: "Your needs", emoji: "🙏" },
  { label: "Your post", emoji: "✨" },
];

export function QuickPostWizard({ onPostCreated }: { onPostCreated?: () => void }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkContent, isChecking } = useContentModeration();

  const [currentStep, setCurrentStep] = useState(0);
  const [strengths, setStrengths] = useState("");
  const [needs, setNeeds] = useState("");
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem(WIZARD_STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.strengths) setStrengths(data.strengths);
        if (data.needs) setNeeds(data.needs);
        if (data.generatedPost) {
          setGeneratedPost(data.generatedPost);
          setCurrentStep(2);
        } else if (data.needs) {
          setCurrentStep(1);
        }
      } catch (e) {
        console.error('Failed to load wizard progress:', e);
      }
    }
  }, []);

  // Save progress
  useEffect(() => {
    if (strengths || needs || generatedPost) {
      localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify({
        strengths, needs, generatedPost, timestamp: Date.now()
      }));
    }
  }, [strengths, needs, generatedPost]);

  const handleNext = async () => {
    if (currentStep === 0) {
      if (!strengths.trim()) {
        toast.error("Tell us what you're good at first!");
        return;
      }
      setCurrentStep(1);
    } else if (currentStep === 1) {
      if (!needs.trim()) {
        toast.error("Tell us what you need help with!");
        return;
      }
      await generatePost();
    }
  };

  const generatePost = async () => {
    setIsGenerating(true);
    setCurrentStep(2);

    try {
      const { data, error } = await supabase.functions.invoke('brainstorm-skills', {
        body: { strengths, needs, mode: 'quick_post' }
      });

      if (error) throw error;
      setGeneratedPost(data.post);
    } catch (error) {
      console.error('Error generating post:', error);
      toast.error("Couldn't generate your post. Please try again.");
      setCurrentStep(1);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePost = async () => {
    if (!generatedPost) return;

    if (!user) {
      localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify({
        strengths, needs, generatedPost, pendingPost: true, timestamp: Date.now()
      }));
      toast.info("Please sign in to publish your post");
      navigate('/auth?redirect=/browse');
      return;
    }

    setIsPosting(true);

    try {
      // Content moderation
      const moderationResult = await checkContent(generatedPost.title, generatedPost.description);
      const moderationStatus = moderationResult.approved ? 'approved' : 'pending_review';

      // Get user profile for location
      const { data: profile } = await supabase
        .from('profiles')
        .select('location')
        .eq('id', user.id)
        .maybeSingle();

      const validCategory = Object.keys(categoryLabels).includes(generatedPost.category)
        ? generatedPost.category
        : 'other';

      const { data: newService, error } = await supabase.from('services').insert({
        user_id: user.id,
        title: generatedPost.title,
        description: generatedPost.description,
        category: validCategory,
        location: profile?.location || 'Ireland',
        type: 'skill_swap',
        status: 'active',
        moderation_status: moderationStatus,
        moderation_reason: moderationResult.reason,
      }).select().single();

      if (error) throw error;

      trackServiceCreated(user.id, newService.id, generatedPost.title);

      if (moderationResult.approved) {
        fireConfetti();
        toast.success("🎉 Your post is live! Nice one!");
      } else {
        toast.warning("Your post has been submitted for review.");
      }

      // Clear wizard state
      localStorage.removeItem(WIZARD_STORAGE_KEY);
      setCurrentStep(0);
      setStrengths("");
      setNeeds("");
      setGeneratedPost(null);
      onPostCreated?.();
    } catch (err) {
      console.error('Error posting:', err);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleEditBeforePosting = () => {
    if (!generatedPost) return;
    const params = new URLSearchParams({
      title: generatedPost.title,
      description: generatedPost.description,
      fromBrainstorm: 'true'
    });
    localStorage.removeItem(WIZARD_STORAGE_KEY);
    navigate(`/services/new?${params.toString()}`);
  };

  const resetWizard = () => {
    localStorage.removeItem(WIZARD_STORAGE_KEY);
    setCurrentStep(0);
    setStrengths("");
    setNeeds("");
    setGeneratedPost(null);
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="w-full p-3 rounded-xl border border-primary/20 bg-primary/5 text-left flex items-center gap-2 hover:bg-primary/10 transition-colors"
      >
        <Wand2 className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-medium">Not sure what to post? Let AI help you →</span>
      </button>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-transparent overflow-hidden">
      <CardContent className="pt-6 pb-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Wand2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Quick Post Wizard</h3>
              <p className="text-xs text-muted-foreground">
                Answer 2 questions → get a ready-to-post listing
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setCollapsed(true)}>
            Hide
          </Button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-1 mb-5">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`flex items-center gap-1.5 text-xs font-medium ${
                i === currentStep ? 'text-primary' : i < currentStep ? 'text-primary/60' : 'text-muted-foreground'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  i < currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : i === currentStep 
                      ? 'bg-primary/20 text-primary border border-primary/40' 
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {i < currentStep ? <Check className="h-3 w-3" /> : step.emoji}
                </div>
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded ${
                  i < currentStep ? 'bg-primary/40' : 'bg-border'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Strengths */}
        {currentStep === 0 && (
          <div className="space-y-3">
            <label className="text-sm font-medium block">
              💪 What are you good at, love doing, or things others usually pay for that you can do yourself?
            </label>
            <Textarea
              placeholder="e.g., I'm great at cooking, I can fix computers, I give brilliant haircuts, I'm good with spreadsheets..."
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              className="min-h-[90px] resize-none bg-background"
              autoFocus
            />
            <Button onClick={handleNext} className="w-full" disabled={!strengths.trim()}>
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Step 2: Needs */}
        {currentStep === 1 && (
          <div className="space-y-3">
            <label className="text-sm font-medium block">
              🙏 What everyday services do you usually pay for, can't do, or don't like doing?
            </label>
            <Textarea
              placeholder="e.g., I'm terrible at gardening, I need help with my CV, I want to learn guitar, my house needs painting..."
              value={needs}
              onChange={(e) => setNeeds(e.target.value)}
              className="min-h-[90px] resize-none bg-background"
              autoFocus
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentStep(0)}>
                <ArrowLeft className="h-3 w-3 mr-1" />
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1" disabled={!needs.trim()}>
                <Sparkles className="h-4 w-4 mr-1" />
                Generate My Post
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Generated post / loading */}
        {currentStep === 2 && (
          <div className="space-y-4">
            {isGenerating ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Writing your post...</p>
              </div>
            ) : generatedPost ? (
              <>
                <div className="p-4 rounded-xl border border-primary/20 bg-background space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-base leading-tight">{generatedPost.title}</h4>
                    {generatedPost.category && categoryLabels[generatedPost.category as ServiceCategory] && (
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {categoryLabels[generatedPost.category as ServiceCategory]}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{generatedPost.description}</p>
                  <div className="flex flex-wrap gap-1.5 text-xs pt-1">
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                      ✅ Offering: {generatedPost.offerSummary}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-accent/10 text-accent-foreground font-medium">
                      🔍 Looking for: {generatedPost.needSummary}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditBeforePosting}
                    className="gap-1"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit First
                  </Button>
                  <Button
                    onClick={handlePost}
                    className="flex-1"
                    disabled={isPosting || isChecking}
                  >
                    {isPosting || isChecking ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Check className="h-4 w-4 mr-1" />
                    )}
                    {user ? 'Post This Now' : 'Sign In to Post'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft className="h-3 w-3 mr-1" />
                    Edit answers
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={generatePost}>
                    <Sparkles className="h-3 w-3 mr-1" />
                    Regenerate
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Reset link */}
        {(currentStep > 0 || generatedPost) && (
          <div className="mt-3 text-center">
            <button
              onClick={resetWizard}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Start over
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
