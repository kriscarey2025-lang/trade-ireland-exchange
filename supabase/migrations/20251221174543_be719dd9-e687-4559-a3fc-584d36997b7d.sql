-- Drop existing policies on messages table
DROP POLICY IF EXISTS "Users can mark messages as read" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;

-- Create a SECURITY DEFINER function to check conversation participation
-- This prevents any potential RLS bypass through complex query manipulation
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE id = _conversation_id
      AND (participant_1 = _user_id OR participant_2 = _user_id)
  )
$$;

-- Recreate RLS policies using the secure function
-- SELECT: Users can only view messages in conversations they participate in
CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
TO authenticated
USING (
  public.is_conversation_participant(conversation_id, auth.uid())
);

-- INSERT: Users can only send messages as themselves in their conversations
CREATE POLICY "Users can send messages in their conversations"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND public.is_conversation_participant(conversation_id, auth.uid())
);

-- UPDATE: Users can only mark messages as read in their conversations (not edit content)
CREATE POLICY "Users can mark messages as read"
ON public.messages
FOR UPDATE
TO authenticated
USING (
  public.is_conversation_participant(conversation_id, auth.uid())
)
WITH CHECK (
  public.is_conversation_participant(conversation_id, auth.uid())
);