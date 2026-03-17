
-- Create service_comments table
CREATE TABLE public.service_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_comments ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view comments on approved services
CREATE POLICY "Anyone can view comments"
ON public.service_comments FOR SELECT
TO public
USING (true);

-- Authenticated users can insert their own comments
CREATE POLICY "Users can create their own comments"
ON public.service_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
ON public.service_comments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own comments, admins can delete any
CREATE POLICY "Users can delete their own comments"
ON public.service_comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Add reported_comment_id to reports table for comment reports
ALTER TABLE public.reports ADD COLUMN reported_comment_id uuid REFERENCES public.service_comments(id) ON DELETE SET NULL;
