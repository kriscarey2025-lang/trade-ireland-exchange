-- Add edited_at column to messages table for tracking edits
ALTER TABLE public.messages 
ADD COLUMN edited_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create an index for performance when filtering edited messages
CREATE INDEX idx_messages_edited_at ON public.messages(edited_at) WHERE edited_at IS NOT NULL;