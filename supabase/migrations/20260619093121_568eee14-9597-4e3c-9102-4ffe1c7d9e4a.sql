
CREATE TABLE public.newsletter_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment SMALLINT NOT NULL CHECK (segment IN (1,2)),
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','sent','failed')),
  sent_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
GRANT SELECT ON public.newsletter_runs TO authenticated;
GRANT ALL ON public.newsletter_runs TO service_role;
ALTER TABLE public.newsletter_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view newsletter runs" ON public.newsletter_runs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_newsletter_runs_pending ON public.newsletter_runs(status, scheduled_for);
