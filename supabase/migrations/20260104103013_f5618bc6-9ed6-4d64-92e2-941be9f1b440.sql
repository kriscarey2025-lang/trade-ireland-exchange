-- Add swap acceptance workflow fields to conversations
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS accepted_by_1 BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accepted_by_2 BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS agreed_completion_date DATE,
ADD COLUMN IF NOT EXISTS swap_status TEXT DEFAULT 'pending' CHECK (swap_status IN ('pending', 'accepted', 'completed', 'closed'));

-- Add completed swap tracking to services
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS completed_swaps_count INTEGER DEFAULT 0;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_conversations_swap_status ON public.conversations(swap_status);
CREATE INDEX IF NOT EXISTS idx_conversations_agreed_completion_date ON public.conversations(agreed_completion_date);

-- Function to increment completed swaps count
CREATE OR REPLACE FUNCTION public.increment_completed_swaps(_service_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE services
  SET completed_swaps_count = completed_swaps_count + 1
  WHERE id = _service_id;
END;
$$;