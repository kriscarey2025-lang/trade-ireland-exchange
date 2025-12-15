-- Create user engagement events table for granular tracking
CREATE TABLE public.user_engagement (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- 'service_created', 'contact_initiated', 'page_view', 'session'
  page_path TEXT, -- For page view tracking
  duration_seconds INTEGER, -- For time spent tracking
  metadata JSONB DEFAULT '{}', -- Additional context
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_user_engagement_user_id ON public.user_engagement(user_id);
CREATE INDEX idx_user_engagement_event_type ON public.user_engagement(event_type);
CREATE INDEX idx_user_engagement_created_at ON public.user_engagement(created_at DESC);

-- Enable RLS
ALTER TABLE public.user_engagement ENABLE ROW LEVEL SECURITY;

-- Users can insert their own engagement events
CREATE POLICY "Users can insert their own engagement"
ON public.user_engagement
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own engagement
CREATE POLICY "Users can view their own engagement"
ON public.user_engagement
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all engagement
CREATE POLICY "Admins can view all engagement"
ON public.user_engagement
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a function to get user engagement summary
CREATE OR REPLACE FUNCTION public.get_user_engagement_summary(_user_id UUID)
RETURNS TABLE(
  services_created BIGINT,
  contacts_initiated BIGINT,
  total_time_spent_minutes BIGINT,
  last_active_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    COUNT(*) FILTER (WHERE event_type = 'service_created') as services_created,
    COUNT(*) FILTER (WHERE event_type = 'contact_initiated') as contacts_initiated,
    COALESCE(SUM(duration_seconds) FILTER (WHERE event_type = 'session') / 60, 0) as total_time_spent_minutes,
    MAX(created_at) as last_active_at
  FROM user_engagement
  WHERE user_id = _user_id;
$$;