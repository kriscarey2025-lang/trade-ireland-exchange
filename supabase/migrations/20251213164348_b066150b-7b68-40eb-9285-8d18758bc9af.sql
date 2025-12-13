-- Create banned_users table
CREATE TABLE public.banned_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  banned_by UUID NOT NULL,
  reason TEXT NOT NULL,
  related_report_id UUID REFERENCES public.reports(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view banned users
CREATE POLICY "Admins can view banned users"
ON public.banned_users
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can ban users
CREATE POLICY "Admins can ban users"
ON public.banned_users
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can unban users
CREATE POLICY "Admins can unban users"
ON public.banned_users
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to check if user is banned (public access for auth checks)
CREATE OR REPLACE FUNCTION public.is_user_banned(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.banned_users WHERE user_id = _user_id
  )
$$;

-- Add resolved_by column to reports
ALTER TABLE public.reports ADD COLUMN resolved_by UUID;