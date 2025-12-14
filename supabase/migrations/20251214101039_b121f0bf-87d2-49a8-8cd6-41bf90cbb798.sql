-- Add terms acceptance tracking field
ALTER TABLE public.user_preferences
ADD COLUMN terms_accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add a comment for documentation
COMMENT ON COLUMN public.user_preferences.terms_accepted_at IS 'Timestamp when user accepted Terms & Conditions during registration/onboarding';