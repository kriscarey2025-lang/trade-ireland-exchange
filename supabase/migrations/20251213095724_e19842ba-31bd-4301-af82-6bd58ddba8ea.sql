-- Add credits column to profiles table
ALTER TABLE public.profiles
ADD COLUMN credits integer NOT NULL DEFAULT 45;

-- Create a simple credit transactions table for history
CREATE TABLE public.credit_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('signup_bonus', 'earned', 'spent', 'refund')),
  description text,
  related_conversation_id uuid REFERENCES public.conversations(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
ON public.credit_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- System inserts transactions (via trigger or service role)
CREATE POLICY "Users can insert their own transactions"
ON public.credit_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);

-- Insert signup bonus transaction for existing users
INSERT INTO public.credit_transactions (user_id, amount, type, description)
SELECT id, 45, 'signup_bonus', 'Welcome bonus credits'
FROM public.profiles
WHERE id IN (SELECT id FROM public.profiles);