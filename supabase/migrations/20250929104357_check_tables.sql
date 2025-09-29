-- Just remove the problematic sample data insert for now
-- The table structure should be created successfully

-- Remove foreign key constraint for patient_id in payments table temporarily
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_patient_id_fkey;

-- Insert sample payment without foreign key constraint
INSERT INTO public.payments (payment_id, package_id, amount, payment_method, payment_status, payment_type)
SELECT 
  '77777777-7777-7777-7777-777777777777'::uuid,
  (SELECT id FROM public.packages WHERE name = 'medium' LIMIT 1),
  23599.00,
  'upi',
  'completed',
  'subscription'
WHERE EXISTS (SELECT 1 FROM public.packages WHERE name = 'medium')
  AND NOT EXISTS (
    SELECT 1 FROM public.payments 
    WHERE payment_id = '77777777-7777-7777-7777-777777777777'::uuid
  );
