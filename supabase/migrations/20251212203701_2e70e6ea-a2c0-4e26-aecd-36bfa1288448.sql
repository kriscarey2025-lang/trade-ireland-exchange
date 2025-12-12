-- Add accepted_categories column to store what services are accepted in return
ALTER TABLE public.services 
ADD COLUMN accepted_categories text[] DEFAULT NULL;