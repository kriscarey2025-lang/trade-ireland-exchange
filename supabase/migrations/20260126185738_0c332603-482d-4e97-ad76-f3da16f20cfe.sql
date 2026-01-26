-- Create sponsors table to store sponsor display preferences
CREATE TABLE public.sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  email TEXT NOT NULL,
  tier TEXT NOT NULL, -- 'advertising', 'bronze', 'silver', 'gold'
  
  -- Display preferences
  is_public BOOLEAN NOT NULL DEFAULT false,
  display_name TEXT,
  website_url TEXT,
  message TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'past_due'
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- Public can view sponsors that opted to be public
CREATE POLICY "Anyone can view public sponsors"
ON public.sponsors
FOR SELECT
USING (is_public = true AND status = 'active');

-- Admins can manage all sponsors
CREATE POLICY "Admins can manage all sponsors"
ON public.sponsors
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index for public listing
CREATE INDEX idx_sponsors_public_active ON public.sponsors (is_public, status) WHERE is_public = true AND status = 'active';

-- Create index for Stripe lookups
CREATE INDEX idx_sponsors_stripe_customer ON public.sponsors (stripe_customer_id);
CREATE INDEX idx_sponsors_stripe_subscription ON public.sponsors (stripe_subscription_id);