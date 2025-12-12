-- Add type column to distinguish between service offers and requests
ALTER TABLE public.services 
ADD COLUMN type text NOT NULL DEFAULT 'offer' CHECK (type IN ('offer', 'request'));