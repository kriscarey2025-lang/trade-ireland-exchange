-- Add policy for admins to delete any service
CREATE POLICY "Admins can delete any service" 
ON public.services 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));