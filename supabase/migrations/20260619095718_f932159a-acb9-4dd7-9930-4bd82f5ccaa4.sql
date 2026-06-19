
-- 1. Fix reviews INSERT policy: require BOTH sides marked complete
DROP POLICY IF EXISTS "Users can create reviews for their conversations" ON public.reviews;
CREATE POLICY "Users can create reviews for their conversations"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = reviewer_id
  AND EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = reviews.conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
      AND c.completed_by_1 = true
      AND c.completed_by_2 = true
  )
);

-- 2. Recalculate completed_swaps_count from source of truth
UPDATE public.services s
SET completed_swaps_count = sub.actual
FROM (
  SELECT s.id, (
    SELECT count(*) FROM conversations c
    WHERE c.service_id = s.id
      AND c.completed_by_1 = true
      AND c.completed_by_2 = true
  )::int AS actual
  FROM services s
) sub
WHERE s.id = sub.id
  AND COALESCE(s.completed_swaps_count, 0) <> sub.actual;

-- 3. Delete orphan conversation (participant profile no longer exists)
DELETE FROM public.messages WHERE conversation_id = '465bc6a7-642a-4744-b3b7-e8d3ab765bcb';
DELETE FROM public.conversations WHERE id = '465bc6a7-642a-4744-b3b7-e8d3ab765bcb';

-- 4. Delete orphan interests, then add cascading FK
DELETE FROM public.interests
WHERE service_id NOT IN (SELECT id FROM public.services);

ALTER TABLE public.interests
  ADD CONSTRAINT interests_service_id_fkey
  FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;

-- 5. Delete unroutable message/interest notifications
DELETE FROM public.notifications
WHERE type IN ('message','interest')
  AND related_conversation_id IS NULL
  AND related_service_id IS NULL;

-- 6. Clean orphaned related_user_id refs, then add cascading FK
UPDATE public.notifications n
SET related_user_id = NULL
WHERE related_user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = n.related_user_id);

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_related_user_id_fkey
  FOREIGN KEY (related_user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 7. Upgrade related_conversation_id FK to ON DELETE CASCADE
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_related_conversation_id_fkey;
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_related_conversation_id_fkey
  FOREIGN KEY (related_conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;
