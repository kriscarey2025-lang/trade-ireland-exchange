-- Add time-sensitive fields to services table
ALTER TABLE public.services 
ADD COLUMN is_time_sensitive BOOLEAN DEFAULT FALSE,
ADD COLUMN needed_by_date TIMESTAMPTZ;

-- Add comment for clarity
COMMENT ON COLUMN public.services.needed_by_date IS 'NULL with is_time_sensitive=true means ASAP';