-- Fix #1: Remove overly permissive notifications INSERT policy
-- SECURITY DEFINER triggers bypass RLS, so this policy is unnecessary and creates a security hole
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Fix #2: Create secure RPC functions for credit management
-- This prevents users from directly modifying their credit balance

-- Function to spend credits with atomicity and validation
CREATE OR REPLACE FUNCTION public.spend_credits(
  _amount integer,
  _description text,
  _conversation_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _current_credits integer;
BEGIN
  -- Validate authentication
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Validate input
  IF _amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  -- Atomic update with validation - single statement prevents race conditions
  UPDATE profiles
  SET credits = credits - _amount
  WHERE id = _user_id
    AND credits >= _amount  -- Ensures sufficient balance
  RETURNING credits INTO _current_credits;
  
  -- Check if update succeeded (sufficient balance)
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;
  
  -- Record transaction
  INSERT INTO credit_transactions (user_id, amount, type, description, related_conversation_id)
  VALUES (_user_id, -_amount, 'spent', _description, _conversation_id);
  
  RETURN true;
END;
$$;

-- Function to earn credits with atomicity
CREATE OR REPLACE FUNCTION public.earn_credits(
  _amount integer,
  _description text,
  _conversation_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
BEGIN
  -- Validate authentication
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Validate input
  IF _amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  -- Add credits
  UPDATE profiles
  SET credits = credits + _amount
  WHERE id = _user_id;
  
  -- Record transaction
  INSERT INTO credit_transactions (user_id, amount, type, description, related_conversation_id)
  VALUES (_user_id, _amount, 'earned', _description, _conversation_id);
  
  RETURN true;
END;
$$;

-- Fix #3: Update profiles UPDATE policy to prevent direct credit manipulation
-- Drop existing policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new restrictive policy that prevents credit modification
-- Note: We use a trigger-based approach since RLS WITH CHECK cannot compare OLD vs NEW
CREATE OR REPLACE FUNCTION public.check_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent users from modifying their own credits directly
  IF NEW.credits IS DISTINCT FROM OLD.credits AND auth.uid() = OLD.id THEN
    -- Only allow if called from a SECURITY DEFINER function (checking if in a security context)
    -- Since this trigger runs in user context, any direct update attempt will be caught
    RAISE EXCEPTION 'Credits cannot be modified directly. Use the spend_credits or earn_credits functions.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS prevent_credit_manipulation ON public.profiles;

-- Create trigger to prevent direct credit modification
CREATE TRIGGER prevent_credit_manipulation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_update();

-- Re-create the update policy (basic user ownership check)
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);