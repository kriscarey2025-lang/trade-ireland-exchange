-- Add weekly digest preference to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN weekly_digest_enabled boolean DEFAULT false,
ADD COLUMN last_digest_sent_at timestamp with time zone;

-- Enable pg_cron and pg_net extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage to postgres user for cron jobs
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;