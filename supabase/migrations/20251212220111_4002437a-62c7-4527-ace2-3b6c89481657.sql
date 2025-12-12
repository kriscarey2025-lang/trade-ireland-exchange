-- Drop the overly permissive policy that allows anyone to read services directly
DROP POLICY IF EXISTS "Services are viewable by everyone" ON public.services;

-- Create a new policy that only allows authenticated users to read services directly
-- Unauthenticated users must use the RPC functions which hide user_id
CREATE POLICY "Authenticated users can view services"
ON public.services
FOR SELECT
TO authenticated
USING (true);

-- Note: Unauthenticated users can still browse services via get_public_services() 
-- and get_service_by_id() which are SECURITY DEFINER functions that hide user_id