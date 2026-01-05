import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Plus, X, Sparkles, HandHeart, Search, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { allCategories, categoryLabels, categoryIcons } from "@/lib/categories";
import { ServiceCategory } from "@/types";
import { cn } from "@/lib/utils";

interface SkillsManagementCardProps {
  userId: string;
}

export function SkillsManagementCard({ userId }: SkillsManagementCardProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Skills I'm Offering
  const [skillsOffered, setSkillsOffered] = useState<string[]>([]);
  const [skillsOfferedCustom, setSkillsOfferedCustom] = useState<string[]>([]);
  const [customOfferedInput, setCustomOfferedInput] = useState("");

  // Skills I'm Looking For
  const [skillsWanted, setSkillsWanted] = useState<string[]>([]);
  const [skillsWantedCustom, setSkillsWantedCustom] = useState<string[]>([]);
  const [customWantedInput, setCustomWantedInput] = useState("");

  // Original values to track changes
  const [originalState, setOriginalState] = useState({
    skillsOffered: [] as string[],
    skillsOfferedCustom: [] as string[],
    skillsWanted: [] as string[],
    skillsWantedCustom: [] as string[],
  });

  useEffect(() => {
    fetchPreferences();
  }, [userId]);

  useEffect(() => {
    // Check if there are unsaved changes
    const changed = 
      JSON.stringify(skillsOffered) !== JSON.stringify(originalState.skillsOffered) ||
      JSON.stringify(skillsOfferedCustom) !== JSON.stringify(originalState.skillsOfferedCustom) ||
      JSON.stringify(skillsWanted) !== JSON.stringify(originalState.skillsWanted) ||
      JSON.stringify(skillsWantedCustom) !== JSON.stringify(originalState.skillsWantedCustom);
    setHasChanges(changed);
  }, [skillsOffered, skillsOfferedCustom, skillsWanted, skillsWantedCustom, originalState]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('skills_offered, skills_offered_custom, skills_wanted, skills_wanted_custom')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const offered = data.skills_offered || [];
        const offeredCustom = data.skills_offered_custom || [];
        const wanted = data.skills_wanted || [];
        const wantedCustom = data.skills_wanted_custom || [];

        setSkillsOffered(offered);
        setSkillsOfferedCustom(offeredCustom);
        setSkillsWanted(wanted);
        setSkillsWantedCustom(wantedCustom);

        setOriginalState({
          skillsOffered: offered,
          skillsOfferedCustom: offeredCustom,
          skillsWanted: wanted,
          skillsWantedCustom: wantedCustom,
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error("Failed to load skill preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          skills_offered: skillsOffered,
          skills_offered_custom: skillsOfferedCustom,
          skills_wanted: skillsWanted,
          skills_wanted_custom: skillsWantedCustom,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      setOriginalState({
        skillsOffered,
        skillsOfferedCustom,
        skillsWanted,
        skillsWantedCustom,
      });

      toast.success("Skills updated! Your matches will improve.");
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error("Failed to save skills");
    } finally {
      setSaving(false);
    }
  };

  const toggleOfferedSkill = (skill: string) => {
    if (skillsOffered.includes(skill)) {
      setSkillsOffered(skillsOffered.filter(s => s !== skill));
    } else {
      setSkillsOffered([...skillsOffered, skill]);
    }
  };

  const toggleWantedSkill = (skill: string) => {
    if (skillsWanted.includes(skill)) {
      setSkillsWanted(skillsWanted.filter(s => s !== skill));
    } else {
      setSkillsWanted([...skillsWanted, skill]);
    }
  };

  const addCustomOffered = () => {
    const trimmed = customOfferedInput.trim();
    if (trimmed && !skillsOfferedCustom.includes(trimmed) && trimmed.length <= 50) {
      setSkillsOfferedCustom([...skillsOfferedCustom, trimmed]);
      setCustomOfferedInput("");
    }
  };

  const addCustomWanted = () => {
    const trimmed = customWantedInput.trim();
    if (trimmed && !skillsWantedCustom.includes(trimmed) && trimmed.length <= 50) {
      setSkillsWantedCustom([...skillsWantedCustom, trimmed]);
      setCustomWantedInput("");
    }
  };

  if (loading) {
    return (
      <Card className="shadow-elevated border-border/50">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elevated border-border/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Skill Preferences
        </CardTitle>
        <CardDescription>
          Tell us what you offer and what you're looking for. This powers your AI matches!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Skills I'm Offering */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <HandHeart className="h-5 w-5 text-primary" />
            <Label className="text-base font-semibold">Skills I Can Offer</Label>
          </div>
          <p className="text-sm text-muted-foreground -mt-2">
            Select the skills and services you can provide to others
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allCategories.map((cat) => {
              const isSelected = skillsOffered.includes(cat);
              return (
                <button
                  key={`offered-${cat}`}
                  type="button"
                  onClick={() => toggleOfferedSkill(cat)}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-lg border transition-all duration-200 text-left",
                    "hover:scale-[1.01] active:scale-[0.99]",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <span className="text-lg">{categoryIcons[cat]}</span>
                  <span className="text-xs font-medium truncate">{categoryLabels[cat]}</span>
                </button>
              );
            })}
          </div>

          {/* Custom offered skills */}
          <div className="flex gap-2">
            <Input
              value={customOfferedInput}
              onChange={(e) => setCustomOfferedInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomOffered())}
              placeholder="Add custom skill (e.g., Piano lessons)"
              maxLength={50}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addCustomOffered}
              disabled={!customOfferedInput.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {skillsOfferedCustom.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skillsOfferedCustom.map((skill) => (
                <Badge key={skill} variant="secondary" className="pl-3 pr-1 py-1.5">
                  {skill}
                  <button
                    type="button"
                    onClick={() => setSkillsOfferedCustom(skillsOfferedCustom.filter(s => s !== skill))}
                    className="ml-1 p-0.5 rounded-full hover:bg-destructive/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {(skillsOffered.length > 0 || skillsOfferedCustom.length > 0) && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{skillsOffered.length + skillsOfferedCustom.length}</span> skill{skillsOffered.length + skillsOfferedCustom.length !== 1 ? 's' : ''} you can offer
            </p>
          )}
        </div>

        <Separator />

        {/* Skills I'm Looking For */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <Label className="text-base font-semibold">Skills I'm Looking For</Label>
          </div>
          <p className="text-sm text-muted-foreground -mt-2">
            Select what you'd like to receive in exchange
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allCategories.map((cat) => {
              const isSelected = skillsWanted.includes(cat);
              return (
                <button
                  key={`wanted-${cat}`}
                  type="button"
                  onClick={() => toggleWantedSkill(cat)}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-lg border transition-all duration-200 text-left",
                    "hover:scale-[1.01] active:scale-[0.99]",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <span className="text-lg">{categoryIcons[cat]}</span>
                  <span className="text-xs font-medium truncate">{categoryLabels[cat]}</span>
                </button>
              );
            })}
          </div>

          {/* Custom wanted skills */}
          <div className="flex gap-2">
            <Input
              value={customWantedInput}
              onChange={(e) => setCustomWantedInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomWanted())}
              placeholder="Add custom skill (e.g., Bike repair)"
              maxLength={50}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addCustomWanted}
              disabled={!customWantedInput.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {skillsWantedCustom.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skillsWantedCustom.map((skill) => (
                <Badge key={skill} variant="secondary" className="pl-3 pr-1 py-1.5">
                  {skill}
                  <button
                    type="button"
                    onClick={() => setSkillsWantedCustom(skillsWantedCustom.filter(s => s !== skill))}
                    className="ml-1 p-0.5 rounded-full hover:bg-destructive/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {(skillsWanted.length > 0 || skillsWantedCustom.length > 0) && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{skillsWanted.length + skillsWantedCustom.length}</span> skill{skillsWanted.length + skillsWantedCustom.length !== 1 ? 's' : ''} you're looking for
            </p>
          )}
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="pt-2">
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Skill Preferences
                </>
              )}
            </Button>
          </div>
        )}

        {/* Hint */}
        <p className="text-xs text-muted-foreground text-center">
          💡 The more specific you are, the better your AI matches will be!
        </p>
      </CardContent>
    </Card>
  );
}
