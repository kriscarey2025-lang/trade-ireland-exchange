-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Only admins can manage roles (using security definer function)
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create function for admin to view verification requests
CREATE OR REPLACE FUNCTION public.get_pending_verifications()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  document_url text,
  document_type text,
  status text,
  admin_notes text,
  submitted_at timestamp with time zone,
  reviewed_at timestamp with time zone,
  user_name text,
  user_email text,
  user_avatar text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  RETURN QUERY
  SELECT 
    vr.id,
    vr.user_id,
    vr.document_url,
    vr.document_type,
    vr.status,
    vr.admin_notes,
    vr.submitted_at,
    vr.reviewed_at,
    p.full_name as user_name,
    p.email as user_email,
    p.avatar_url as user_avatar
  FROM verification_requests vr
  JOIN profiles p ON vr.user_id = p.id
  ORDER BY 
    CASE WHEN vr.status = 'pending' THEN 0 ELSE 1 END,
    vr.submitted_at DESC;
END;
$$;

-- Create function for admin to approve/reject verification
CREATE OR REPLACE FUNCTION public.review_verification(
  _request_id uuid,
  _approved boolean,
  _notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _new_status text;
BEGIN
  -- Only allow admins
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  _new_status := CASE WHEN _approved THEN 'approved' ELSE 'rejected' END;
  
  -- Get the user_id from the request
  SELECT user_id INTO _user_id
  FROM verification_requests
  WHERE id = _request_id;
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Verification request not found';
  END IF;
  
  -- Update the verification request
  UPDATE verification_requests
  SET 
    status = _new_status,
    admin_notes = _notes,
    reviewed_at = now()
  WHERE id = _request_id;
  
  -- Update the user's profile verification status
  UPDATE profiles
  SET verification_status = CASE WHEN _approved THEN 'verified' ELSE 'rejected' END
  WHERE id = _user_id;
END;
$$;

-- Create function for admin to get signed URL for document
CREATE OR REPLACE FUNCTION public.get_verification_document_url(_request_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _document_url text;
BEGIN
  -- Only allow admins
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  SELECT document_url INTO _document_url
  FROM verification_requests
  WHERE id = _request_id;
  
  RETURN _document_url;
END;
$$;