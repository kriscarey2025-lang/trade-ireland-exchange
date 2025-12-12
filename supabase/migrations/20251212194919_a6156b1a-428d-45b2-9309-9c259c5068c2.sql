-- Create contact_shares table to track consent for sharing contact info
CREATE TABLE public.contact_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  shared_with_id UUID NOT NULL,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (owner_id, shared_with_id, conversation_id)
);

-- Enable RLS
ALTER TABLE public.contact_shares ENABLE ROW LEVEL SECURITY;

-- Users can view their own shares (given or received)
CREATE POLICY "Users can view their contact shares"
ON public.contact_shares
FOR SELECT
USING (auth.uid() = owner_id OR auth.uid() = shared_with_id);

-- Users can create shares for their own contact info
CREATE POLICY "Users can share their own contact info"
ON public.contact_shares
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Users can revoke shares they created
CREATE POLICY "Users can revoke their own shares"
ON public.contact_shares
FOR DELETE
USING (auth.uid() = owner_id);

-- Create a security definer function to check if contact is shared
CREATE OR REPLACE FUNCTION public.has_contact_access(_viewer_id UUID, _profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.contact_shares
    WHERE owner_id = _profile_id 
    AND shared_with_id = _viewer_id
  )
$$;

-- Create a view for safe profile data (non-sensitive only)
-- This returns full_name, avatar_url, bio for conversation participants
-- and email/phone only when explicitly shared

-- Drop the existing profile policy and create a more nuanced one
DROP POLICY IF EXISTS "Users can view relevant profiles" ON public.profiles;

-- Policy: Users can always view their own profile
-- For other profiles in conversations, they can only see non-sensitive fields
-- Sensitive fields (email, phone) require explicit consent via contact_shares
CREATE POLICY "Users can view own profile fully"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Create a secure function to get profile with contact visibility
CREATE OR REPLACE FUNCTION public.get_profile_for_conversation(_profile_id UUID)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  contact_shared BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _viewer_id UUID := auth.uid();
  _has_access BOOLEAN;
  _in_conversation BOOLEAN;
BEGIN
  -- Check if viewer is in a conversation with this profile
  SELECT EXISTS (
    SELECT 1 FROM conversations 
    WHERE (participant_1 = _viewer_id AND participant_2 = _profile_id) 
    OR (participant_2 = _viewer_id AND participant_1 = _profile_id)
  ) INTO _in_conversation;
  
  -- Check if contact has been shared
  SELECT public.has_contact_access(_viewer_id, _profile_id) INTO _has_access;
  
  -- If viewing own profile, return everything
  IF _viewer_id = _profile_id THEN
    RETURN QUERY
    SELECT p.id, p.full_name, p.avatar_url, p.bio, p.email, p.phone, p.location, true
    FROM profiles p WHERE p.id = _profile_id;
  -- If in conversation, return based on share status
  ELSIF _in_conversation THEN
    RETURN QUERY
    SELECT 
      p.id, 
      p.full_name, 
      p.avatar_url, 
      p.bio,
      CASE WHEN _has_access THEN p.email ELSE NULL END,
      CASE WHEN _has_access THEN p.phone ELSE NULL END,
      p.location,
      _has_access
    FROM profiles p WHERE p.id = _profile_id;
  END IF;
  
  -- Otherwise return nothing
  RETURN;
END;
$$;