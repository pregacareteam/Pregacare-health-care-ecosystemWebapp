-- Fix payments table to support package system
-- Add missing columns to existing payments table

-- Add package_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'payments' AND column_name = 'package_id') THEN
    ALTER TABLE public.payments ADD COLUMN package_id UUID REFERENCES public.packages(id);
  END IF;
END $$;

-- Add payment_method column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'payments' AND column_name = 'payment_method') THEN
    ALTER TABLE public.payments ADD COLUMN payment_method TEXT DEFAULT 'upi' CHECK (payment_method IN ('upi', 'card', 'netbanking', 'wallet'));
  END IF;
END $$;

-- Add payment_status column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'payments' AND column_name = 'payment_status') THEN
    ALTER TABLE public.payments ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded'));
  END IF;
END $$;

-- Add payment_type column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'payments' AND column_name = 'payment_type') THEN
    ALTER TABLE public.payments ADD COLUMN payment_type TEXT DEFAULT 'subscription' CHECK (payment_type IN ('subscription', 'consultation', 'addon'));
  END IF;
END $$;

-- Enable RLS and create policy if not exists
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on payments" ON public.payments;
CREATE POLICY "Allow all on payments" ON public.payments FOR ALL USING (true);

-- Sample payment data will be inserted separately
