-- Create table for advertiser interest submissions
CREATE TABLE public.advertiser_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT NOT NULL,
  website TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advertiser_interests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit interest (public form)
CREATE POLICY "Anyone can submit advertiser interest"
ON public.advertiser_interests
FOR INSERT
WITH CHECK (true);

-- Admins can view all submissions
CREATE POLICY "Admins can view all advertiser interests"
ON public.advertiser_interests
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update submissions (to change status, add notes)
CREATE POLICY "Admins can update advertiser interests"
ON public.advertiser_interests
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete submissions
CREATE POLICY "Admins can delete advertiser interests"
ON public.advertiser_interests
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_advertiser_interests_updated_at
BEFORE UPDATE ON public.advertiser_interests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();