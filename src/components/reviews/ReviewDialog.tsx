import { useState } from "react";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  reviewedUserId: string;
  reviewedUserName: string;
  serviceId?: string | null;
  serviceTitle?: string;
  onReviewSubmitted?: () => void;
}

function StarRating({
  rating,
  onRatingChange,
  label,
}: {
  rating: number;
  onRatingChange: (rating: number) => void;
  label: string;
}) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= (hoverRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReviewDialog({
  open,
  onOpenChange,
  conversationId,
  reviewedUserId,
  reviewedUserName,
  serviceId,
  serviceTitle,
  onReviewSubmitted,
}: ReviewDialogProps) {
  const [userRating, setUserRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (userRating === 0) {
      toast({
        title: "Rating required",
        description: "Please rate your experience with this person.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("reviews").insert({
        conversation_id: conversationId,
        reviewer_id: user.id,
        reviewed_user_id: reviewedUserId,
        service_id: serviceId || null,
        user_rating: userRating,
        service_rating: serviceRating > 0 ? serviceRating : null,
        review_text: reviewText.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "Review submitted",
        description: "Thanks for sharing your experience!",
      });

      onOpenChange(false);
      onReviewSubmitted?.();

      // Reset form
      setUserRating(0);
      setServiceRating(0);
      setReviewText("");
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogDescription>
            Share your experience with {reviewedUserName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <StarRating
            rating={userRating}
            onRatingChange={setUserRating}
            label={`How was your experience with ${reviewedUserName}?`}
          />

          {serviceTitle && (
            <StarRating
              rating={serviceRating}
              onRatingChange={setServiceRating}
              label={`How was the service "${serviceTitle}"?`}
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="review-text">Written review (optional)</Label>
            <Textarea
              id="review-text"
              placeholder="Tell others about your experience..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {reviewText.length}/500
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
