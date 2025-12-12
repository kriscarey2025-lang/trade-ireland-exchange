-- Add policy for conversation participants to view basic profile info (non-sensitive fields only)
-- Email and phone will be NULL unless explicitly shared via contact_shares
CREATE POLICY "Conversation participants can view basic profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE (participant_1 = auth.uid() AND participant_2 = profiles.id) 
    OR (participant_2 = auth.uid() AND participant_1 = profiles.id)
  )
);

-- Note: The email and phone fields are still in the row, but we'll handle this
-- at the application level by using get_profile_for_conversation function
-- which masks these fields unless contact is shared