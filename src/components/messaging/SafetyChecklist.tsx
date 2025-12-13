import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SafetyChecklistProps {
  onComplete: (allChecked: boolean) => void;
}

const safetyItems = [
  {
    id: "verified",
    label: "I've verified their experience or asked for examples",
    description: "Ask about their background or request work samples"
  },
  {
    id: "terms",
    label: "We've discussed and agreed on the exchange terms",
    description: "Clear on what each person will provide"
  },
  {
    id: "timeline",
    label: "We've agreed on timing and availability",
    description: "Both parties know when the exchange will happen"
  },
  {
    id: "comfortable",
    label: "I feel comfortable proceeding with this swap",
    description: "Trust your instincts about this person"
  }
];

export function SafetyChecklist({ onComplete }: SafetyChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const handleCheck = (id: string, isChecked: boolean) => {
    const newChecked = { ...checked, [id]: isChecked };
    setChecked(newChecked);
    
    const allChecked = safetyItems.every(item => newChecked[item.id]);
    onComplete(allChecked);
  };

  const completedCount = Object.values(checked).filter(Boolean).length;
  const allComplete = completedCount === safetyItems.length;

  return (
    <Card className={cn(
      "border-2 transition-colors",
      allComplete ? "border-green-200 bg-green-50/50" : "border-amber-200 bg-amber-50/50"
    )}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          {allComplete ? (
            <ShieldCheck className="h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          )}
          <span className="font-medium text-sm">
            Safety Checklist ({completedCount}/{safetyItems.length})
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          Before sharing your contact info, please confirm:
        </p>

        <div className="space-y-3">
          {safetyItems.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <Checkbox
                id={item.id}
                checked={checked[item.id] || false}
                onCheckedChange={(isChecked) => handleCheck(item.id, isChecked === true)}
                className="mt-0.5"
              />
              <div className="space-y-0.5">
                <label
                  htmlFor={item.id}
                  className="text-sm font-medium cursor-pointer leading-tight"
                >
                  {item.label}
                </label>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {!allComplete && (
          <p className="text-xs text-amber-700 bg-amber-100 rounded-md p-2">
            Complete all items to share your contact information safely
          </p>
        )}
      </CardContent>
    </Card>
  );
}
