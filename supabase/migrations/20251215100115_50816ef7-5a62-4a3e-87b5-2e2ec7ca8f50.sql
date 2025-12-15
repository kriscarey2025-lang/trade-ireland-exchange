-- Add reported_service_id column to reports table for service reports
ALTER TABLE public.reports ADD COLUMN reported_service_id UUID REFERENCES public.services(id) ON DELETE SET NULL;

-- Create index for efficient querying
CREATE INDEX idx_reports_service_id ON public.reports(reported_service_id) WHERE reported_service_id IS NOT NULL;

-- Add check constraint to ensure at least one of reported_user_id or reported_service_id is provided
-- But since reported_user_id is NOT NULL, we don't need this - service reports will still have the service owner as reported_user_id

-- Update policy to allow service reports (already covered by existing policy since we use reported_user_id)