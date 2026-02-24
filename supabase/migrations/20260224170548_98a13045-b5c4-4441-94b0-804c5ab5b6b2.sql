
-- Create event_rsvps table
CREATE TABLE public.event_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  is_registered_user BOOLEAN NOT NULL DEFAULT false,
  user_id UUID NULL,
  attendance TEXT NOT NULL DEFAULT 'yes',
  time_preference TEXT NOT NULL DEFAULT 'either',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an RSVP (public form)
CREATE POLICY "Anyone can submit event RSVP"
ON public.event_rsvps
FOR INSERT
WITH CHECK (true);

-- Only admins can view RSVPs
CREATE POLICY "Admins can view event RSVPs"
ON public.event_rsvps
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete RSVPs
CREATE POLICY "Admins can delete event RSVPs"
ON public.event_rsvps
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
