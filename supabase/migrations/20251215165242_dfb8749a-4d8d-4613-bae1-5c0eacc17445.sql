-- First drop any existing constraint
ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_type_check;

-- Update existing data to map to new values
UPDATE public.services SET type = 'skill_swap' WHERE type = 'offer';
UPDATE public.services SET type = 'help_request' WHERE type = 'request';

-- Now add the check constraint
ALTER TABLE public.services ADD CONSTRAINT services_type_check 
  CHECK (type IN ('free_offer', 'help_request', 'skill_swap'));

-- Update the default value
ALTER TABLE public.services ALTER COLUMN type SET DEFAULT 'skill_swap';