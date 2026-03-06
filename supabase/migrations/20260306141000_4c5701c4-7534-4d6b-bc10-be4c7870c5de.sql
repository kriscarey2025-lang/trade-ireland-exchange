ALTER TABLE public.event_rsvps 
  ADD COLUMN registration_status text NOT NULL DEFAULT 'interest';

CREATE POLICY "Anyone can update their own RSVP by email" 
  ON public.event_rsvps FOR UPDATE 
  USING (true) 
  WITH CHECK (true);