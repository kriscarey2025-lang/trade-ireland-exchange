-- Add is_founder field to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_founder boolean DEFAULT false;

-- Mark the first 50 users as founders based on created_at
UPDATE public.profiles
SET is_founder = true
WHERE id IN (
  SELECT id FROM public.profiles
  ORDER BY created_at ASC
  LIMIT 50
);