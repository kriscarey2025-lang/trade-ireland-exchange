-- Add email notification preferences for messages and interests
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS message_emails_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS interest_emails_enabled boolean DEFAULT true;