-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  reviewed_user_id UUID NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  user_rating INTEGER NOT NULL CHECK (user_rating >= 1 AND user_rating <= 5),
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Prevent duplicate reviews: one user can only review the other once per conversation
  UNIQUE(conversation_id, reviewer_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Add completed_at column to conversations to track when trades are marked complete
ALTER TABLE public.conversations 
ADD COLUMN completed_by_1 BOOLEAN DEFAULT false,
ADD COLUMN completed_by_2 BOOLEAN DEFAULT false;

-- RLS Policies for reviews

-- Anyone can view reviews (for trust building)
CREATE POLICY "Reviews are publicly viewable"
ON public.reviews
FOR SELECT
USING (true);

-- Users can create reviews only for conversations they're part of
CREATE POLICY "Users can create reviews for their conversations"
ON public.reviews
FOR INSERT
WITH CHECK (
  auth.uid() = reviewer_id
  AND EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    AND (c.completed_by_1 = true OR c.completed_by_2 = true)
  )
);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
ON public.reviews
FOR UPDATE
USING (auth.uid() = reviewer_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
ON public.reviews
FOR DELETE
USING (auth.uid() = reviewer_id);

-- Update conversation policy to allow marking as complete
CREATE POLICY "Users can mark their conversations complete"
ON public.conversations
FOR UPDATE
USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Create function to get average ratings for a user
CREATE OR REPLACE FUNCTION public.get_user_ratings(_user_id uuid)
RETURNS TABLE(
  avg_user_rating NUMERIC,
  avg_service_rating NUMERIC,
  total_reviews BIGINT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ROUND(AVG(user_rating)::numeric, 1) as avg_user_rating,
    ROUND(AVG(service_rating)::numeric, 1) as avg_service_rating,
    COUNT(*) as total_reviews
  FROM reviews
  WHERE reviewed_user_id = _user_id;
$$;