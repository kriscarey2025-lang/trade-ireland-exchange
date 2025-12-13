-- Create table to log user IPs
CREATE TABLE public.user_ip_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_user_ip_logs_user_id ON public.user_ip_logs(user_id);
CREATE INDEX idx_user_ip_logs_ip_address ON public.user_ip_logs(ip_address);

-- Enable RLS
ALTER TABLE public.user_ip_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view IP logs
CREATE POLICY "Admins can view IP logs"
ON public.user_ip_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create banned IPs table
CREATE TABLE public.banned_ips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL UNIQUE,
  banned_by UUID NOT NULL,
  reason TEXT NOT NULL,
  related_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.banned_ips ENABLE ROW LEVEL SECURITY;

-- Only admins can view banned IPs
CREATE POLICY "Admins can view banned IPs"
ON public.banned_ips
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can ban IPs
CREATE POLICY "Admins can ban IPs"
ON public.banned_ips
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can unban IPs
CREATE POLICY "Admins can unban IPs"
ON public.banned_ips
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Function to check if an IP is banned
CREATE OR REPLACE FUNCTION public.is_ip_banned(_ip_address TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.banned_ips WHERE ip_address = _ip_address
  )
$$;

-- Function to log user IP (called from edge function with service role)
CREATE OR REPLACE FUNCTION public.log_user_ip(_user_id UUID, _ip_address TEXT, _user_agent TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only insert if this IP hasn't been logged for this user in the last hour
  IF NOT EXISTS (
    SELECT 1 FROM user_ip_logs 
    WHERE user_id = _user_id 
    AND ip_address = _ip_address 
    AND created_at > now() - INTERVAL '1 hour'
  ) THEN
    INSERT INTO user_ip_logs (user_id, ip_address, user_agent)
    VALUES (_user_id, _ip_address, _user_agent);
  END IF;
END;
$$;