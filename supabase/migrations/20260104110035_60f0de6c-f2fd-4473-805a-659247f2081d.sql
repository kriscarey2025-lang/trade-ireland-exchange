-- Add offered skill columns to conversations table
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS offered_skill text,
ADD COLUMN IF NOT EXISTS offered_skill_category text;