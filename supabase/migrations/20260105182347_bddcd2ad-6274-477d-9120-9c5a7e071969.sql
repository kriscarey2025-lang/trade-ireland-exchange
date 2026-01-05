-- Create table to track sent welcome emails for deduplication
CREATE TABLE public.welcome_emails_sent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX idx_welcome_emails_sent_email ON public.welcome_emails_sent(email);

-- Enable RLS (only edge functions with service role can access)
ALTER TABLE public.welcome_emails_sent ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed - only service role (edge functions) should access this table