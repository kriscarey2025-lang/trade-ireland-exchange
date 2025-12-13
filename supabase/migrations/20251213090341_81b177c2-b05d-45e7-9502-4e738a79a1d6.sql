-- Update contact_shares INSERT policy to require a valid conversation between parties
DROP POLICY IF EXISTS "Users can share their own contact info" ON public.contact_shares;

CREATE POLICY "Users can share contact with conversation participants"
ON public.contact_shares
FOR INSERT
WITH CHECK (
  auth.uid() = owner_id 
  AND EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = conversation_id
    AND ((participant_1 = owner_id AND participant_2 = shared_with_id)
         OR (participant_2 = owner_id AND participant_1 = shared_with_id))
  )
);