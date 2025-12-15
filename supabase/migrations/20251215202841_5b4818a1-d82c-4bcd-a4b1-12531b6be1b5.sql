-- Add moderation columns to services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS moderation_reason text,
ADD COLUMN IF NOT EXISTS moderated_at timestamp with time zone;

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_services_moderation_status ON public.services(moderation_status);

-- Update RLS policy to only show approved services to non-owners
DROP POLICY IF EXISTS "Authenticated users can view services" ON public.services;

CREATE POLICY "Users can view approved services or their own"
ON public.services
FOR SELECT
USING (
  moderation_status = 'approved' 
  OR auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Create moderation logs table for audit trail
CREATE TABLE IF NOT EXISTS public.moderation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES public.services(id) ON DELETE CASCADE,
  action text NOT NULL,
  reason text,
  reviewed_by uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on moderation_logs
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage moderation logs
CREATE POLICY "Admins can manage moderation logs"
ON public.moderation_logs
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));