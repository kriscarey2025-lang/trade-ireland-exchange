-- Update the default value for weekly_digest_enabled to true for new users
ALTER TABLE public.user_preferences 
ALTER COLUMN weekly_digest_enabled SET DEFAULT true;