-- Table to track service views that haven't resulted in contact
CREATE TABLE public.browse_nudges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  service_title TEXT NOT NULL,
  provider_name TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  nudge_sent_at TIMESTAMP WITH TIME ZONE,
  contacted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, service_id)
);

-- Enable RLS
ALTER TABLE public.browse_nudges ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only see their own nudges, system inserts via function
CREATE POLICY "Users can view their own nudges"
  ON public.browse_nudges
  FOR SELECT
  USING (auth.uid() = user_id);

-- Function to record a service view for nudge tracking
CREATE OR REPLACE FUNCTION public.record_service_view(
  _service_id UUID,
  _service_title TEXT,
  _provider_name TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only insert if user hasn't already contacted about this service
  INSERT INTO public.browse_nudges (user_id, service_id, service_title, provider_name, viewed_at)
  VALUES (auth.uid(), _service_id, _service_title, _provider_name, now())
  ON CONFLICT (user_id, service_id) 
  DO UPDATE SET viewed_at = now()
  WHERE browse_nudges.contacted_at IS NULL AND browse_nudges.nudge_sent_at IS NULL;
END;
$$;

-- Function to mark a service as contacted (called when conversation starts)
CREATE OR REPLACE FUNCTION public.mark_service_contacted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a conversation is created, mark any browse nudge as contacted
  UPDATE public.browse_nudges
  SET contacted_at = now()
  WHERE user_id = NEW.participant_1
    AND service_id = NEW.service_id
    AND contacted_at IS NULL;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-mark contacted when conversation created
CREATE TRIGGER on_conversation_created_mark_contacted
  AFTER INSERT ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.mark_service_contacted();

-- Index for efficient querying of pending nudges
CREATE INDEX idx_browse_nudges_pending 
  ON public.browse_nudges (viewed_at) 
  WHERE nudge_sent_at IS NULL AND contacted_at IS NULL;