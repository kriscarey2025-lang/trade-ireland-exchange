
-- Track Trustpilot review invite emails sent
CREATE TABLE public.trustpilot_invites_sent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  user_id UUID,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT trustpilot_invites_sent_email_unique UNIQUE(email)
);

-- Enable RLS
ALTER TABLE public.trustpilot_invites_sent ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table (used by edge functions only)
CREATE POLICY "Service role only" ON public.trustpilot_invites_sent
  FOR ALL USING (false);
