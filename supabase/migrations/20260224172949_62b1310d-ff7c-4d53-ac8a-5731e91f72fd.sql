
CREATE TABLE public.event_invites_sent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  event_slug TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID,
  UNIQUE(email, event_slug)
);

ALTER TABLE public.event_invites_sent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage event invites"
ON public.event_invites_sent
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));
