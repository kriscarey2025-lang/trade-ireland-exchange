import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X, Plus, Sparkles } from "lucide-react";
import { allCategories, categoryLabels, categoryIcons } from "@/lib/categories";
import { ServiceCategory } from "@/types";
import { cn } from "@/lib/utils";

interface SkillSelectorProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  customSkills: string[];
  onCustomSkillsChange: (skills: string[]) => void;
  openToGeneralOffers: boolean;
  onOpenToGeneralOffersChange: (open: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
}

export function SkillSelector({
  selectedSkills,
  onSkillsChange,
  customSkills,
  onCustomSkillsChange,
  openToGeneralOffers,
  onOpenToGeneralOffersChange,
  disabled = false,
  label = "Skills I'd Accept in Return",
  description = "Select the types of services you'd be open to receiving as a trade",
}: SkillSelectorProps) {
  const [customInput, setCustomInput] = useState("");

  const toggleSkill = (skill: string) => {
    if (disabled) return;
    if (selectedSkills.includes(skill)) {
      onSkillsChange(selectedSkills.filter((s) => s !== skill));
    } else {
      onSkillsChange([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = () => {
    const trimmed = customInput.trim();
    if (trimmed && !customSkills.includes(trimmed) && trimmed.length <= 50) {
      onCustomSkillsChange([...customSkills, trimmed]);
      setCustomInput("");
    }
  };

  const removeCustomSkill = (skill: string) => {
    if (disabled) return;
    onCustomSkillsChange(customSkills.filter((s) => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomSkill();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Open to General Offers Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-foreground">Open to General Offers</p>
            <p className="text-sm text-muted-foreground">Accept any skill or service offers</p>
          </div>
        </div>
        <Switch
          checked={openToGeneralOffers}
          onCheckedChange={onOpenToGeneralOffersChange}
          disabled={disabled}
        />
      </div>

      {/* Category Skills Grid */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Or select specific categories:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {allCategories.map((cat) => {
            const isSelected = selectedSkills.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleSkill(cat)}
                disabled={disabled}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-left",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  isSelected
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-card hover:border-primary/50 hover:bg-accent/50",
                  disabled && "opacity-50 cursor-not-allowed hover:scale-100"
                )}
              >
                <span className="text-xl">{categoryIcons[cat]}</span>
                <span className="text-sm font-medium truncate">{categoryLabels[cat]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Skills */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Add custom skills:</p>
        <div className="flex gap-2">
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Yoga instruction, Car repairs..."
            disabled={disabled}
            maxLength={50}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={addCustomSkill}
            disabled={disabled || !customInput.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Custom Skills Display */}
        {customSkills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customSkills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="pl-3 pr-1 py-1.5 text-sm flex items-center gap-1"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeCustomSkill(skill)}
                  disabled={disabled}
                  className="ml-1 p-0.5 rounded-full hover:bg-destructive/20 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {(selectedSkills.length > 0 || customSkills.length > 0 || openToGeneralOffers) && (
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <p className="text-sm text-muted-foreground">
            {openToGeneralOffers && (selectedSkills.length > 0 || customSkills.length > 0) ? (
              <>
                <span className="text-primary font-medium">✓ Open to all offers</span>
                {" + "}
                <span className="font-medium text-foreground">
                  {selectedSkills.length + customSkills.length}
                </span>{" "}
                preferred skill{selectedSkills.length + customSkills.length !== 1 ? "s" : ""}
              </>
            ) : openToGeneralOffers ? (
              <span className="text-primary font-medium">✓ Open to all offers</span>
            ) : (
              <>
                <span className="font-medium text-foreground">
                  {selectedSkills.length + customSkills.length}
                </span>{" "}
                skill{selectedSkills.length + customSkills.length !== 1 ? "s" : ""} selected
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
