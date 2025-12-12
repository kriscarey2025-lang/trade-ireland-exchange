-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a new policy that allows viewing own profile OR profiles of conversation participants
CREATE POLICY "Users can view relevant profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id 
  OR EXISTS (
    SELECT 1 FROM conversations 
    WHERE (participant_1 = auth.uid() AND participant_2 = profiles.id) 
    OR (participant_2 = auth.uid() AND participant_1 = profiles.id)
  )
);