import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ReportServiceDialogProps {
  serviceId: string;
  serviceTitle: string;
  serviceOwnerId: string;
}

const REPORT_REASONS = [
  { value: "inappropriate", label: "Inappropriate or offensive content" },
  { value: "spam", label: "Spam or misleading" },
  { value: "scam", label: "Potential scam or fraud" },
  { value: "illegal", label: "Illegal services or products" },
  { value: "other", label: "Other violation" },
];

export function ReportServiceDialog({ serviceId, serviceTitle, serviceOwnerId }: ReportServiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Please select a reason",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "You must be logged in to report a listing",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_user_id: serviceOwnerId,
      reported_service_id: serviceId,
      reason,
      description: description.trim() || null,
    });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Failed to submit report",
        description: "Please try again later.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Report submitted",
      description: "Thank you for helping keep our community safe. We'll review this listing.",
    });

    setOpen(false);
    setReason("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
          <Flag className="h-4 w-4 mr-1" />
          Report Listing
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report this listing</DialogTitle>
          <DialogDescription>
            Help us understand what's wrong with "{serviceTitle}". Your report is confidential.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Reason for report</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {REPORT_REASONS.map((r) => (
                <div key={r.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={r.value} id={`service-${r.value}`} />
                  <Label htmlFor={`service-${r.value}`} className="font-normal cursor-pointer">
                    {r.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="service-description">Additional details (optional)</Label>
            <Textarea
              id="service-description"
              placeholder="Provide any additional context about why this listing is problematic..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} variant="destructive">
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
