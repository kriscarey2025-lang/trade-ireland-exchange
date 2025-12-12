-- Fix the RLS policy to enforce auth.uid() must be participant_1 (initiator)
DROP POLICY IF EXISTS "Users can create conversations they're part of" ON public.conversations;

CREATE POLICY "Users can create conversations as initiator"
ON public.conversations FOR INSERT
WITH CHECK (
  auth.uid() = participant_1 
  AND participant_1 != participant_2  -- Prevent self-conversations
);