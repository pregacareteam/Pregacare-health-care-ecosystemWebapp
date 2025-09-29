-- Simple Package System Migration - Only add what we need

-- Healthcare Packages Table (Fixed 3 packages)
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL CHECK (name IN ('basic', 'medium', 'comprehensive')),
  display_name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_months INTEGER NOT NULL,
  features JSONB DEFAULT '{}',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Simple patients table for package system
CREATE TABLE IF NOT EXISTS public.patients_new (
  patient_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  pregnancy_stage TEXT CHECK (pregnancy_stage IN ('first_trimester', 'second_trimester', 'third_trimester', 'postpartum')),
  expected_delivery_date DATE,
  package_id UUID REFERENCES public.packages(id),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'expired', 'cancelled')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Simple appointments table
CREATE TABLE IF NOT EXISTS public.appointments_new (
  appointment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients_new(patient_id) ON DELETE CASCADE,
  provider_id UUID,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  appointment_type TEXT CHECK (appointment_type IN ('consultation', 'follow_up', 'emergency', 'routine_checkup')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
  doctor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  specialization TEXT NOT NULL,
  experience_years INTEGER DEFAULT 0,
  consultation_fee DECIMAL(10,2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add basic indexes
CREATE INDEX IF NOT EXISTS idx_packages_name ON public.packages(name);
CREATE INDEX IF NOT EXISTS idx_patients_new_email ON public.patients_new(email);
CREATE INDEX IF NOT EXISTS idx_appointments_new_patient_id ON public.appointments_new(patient_id);

-- Enable RLS
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Create open policies for development
DROP POLICY IF EXISTS "Allow all on packages" ON public.packages;
CREATE POLICY "Allow all on packages" ON public.packages FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on patients_new" ON public.patients_new;
CREATE POLICY "Allow all on patients_new" ON public.patients_new FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on appointments_new" ON public.appointments_new;
CREATE POLICY "Allow all on appointments_new" ON public.appointments_new FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on doctors" ON public.doctors;
CREATE POLICY "Allow all on doctors" ON public.doctors FOR ALL USING (true);

-- Insert the 3 fixed packages
INSERT INTO public.packages (package_id, name, display_name, description, price, duration_months, features, is_popular) VALUES
('pkg_basic', 'basic', 'Basic Care', 'Essential prenatal care for healthy pregnancies', 9999, 6, 
 '["Monthly doctor consultations (6 sessions)", "Basic nutrition guidance", "Pregnancy tracking app access", "Educational materials", "24/7 helpline support", "Basic health monitoring"]'::jsonb, false),
('pkg_medium', 'medium', 'Standard Care', 'Comprehensive care with additional wellness services', 19999, 9,
 '["Bi-weekly doctor consultations (18 sessions)", "Personalized nutrition plans", "Weekly yoga sessions (36 sessions)", "Mental health counseling (6 sessions)", "Lab tests and monitoring", "Meal delivery service", "Lactation support", "Emergency consultations"]'::jsonb, true),
('pkg_comprehensive', 'comprehensive', 'Premium Care', 'Complete end-to-end pregnancy and postnatal care', 34999, 12,
 '["Weekly doctor consultations (48 sessions)", "Dedicated nutritionist (unlimited consultations)", "Daily yoga & fitness sessions", "Therapy sessions (unlimited)", "Complete lab test package", "Premium meal delivery", "Home nursing support", "Postnatal care (3 months)", "Baby care guidance", "Family planning consultation", "VIP hospital coordination"]'::jsonb, false)
ON CONFLICT (package_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  duration_months = EXCLUDED.duration_months,
  features = EXCLUDED.features,
  is_popular = EXCLUDED.is_popular,
  updated_at = NOW();

-- Insert sample data
INSERT INTO public.doctors (doctor_id, name, email, specialization, experience_years, consultation_fee) VALUES
('22222222-2222-2222-2222-222222222222', 'Dr. Sarah Smith', 'dr.smith@pregacare.com', 'Gynecology', 10, 1500.00)
ON CONFLICT (doctor_id) DO NOTHING;

-- Insert sample patients
INSERT INTO public.patients_new (patient_id, name, email, phone, pregnancy_stage, expected_delivery_date, package_id) 
SELECT 
  '66666666-6666-6666-6666-666666666666'::uuid,
  'Jane Doe',
  'jane.doe@example.com',
  '+91-9876543210',
  'second_trimester',
  '2025-12-15'::date,
  (SELECT id FROM public.packages WHERE name = 'medium' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.patients_new WHERE email = 'jane.doe@example.com');

INSERT INTO public.patients_new (patient_id, name, email, phone, pregnancy_stage, expected_delivery_date, package_id)
SELECT 
  '77777777-7777-7777-7777-777777777777'::uuid,
  'Sarah Wilson',
  'sarah.wilson@example.com',
  '+91-8765432109',
  'first_trimester',
  '2026-02-20'::date,
  (SELECT id FROM public.packages WHERE name = 'basic' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.patients_new WHERE email = 'sarah.wilson@example.com');

INSERT INTO public.patients_new (patient_id, name, email, phone, pregnancy_stage, expected_delivery_date, package_id)
SELECT 
  '88888888-8888-8888-8888-888888888888'::uuid,
  'Emily Brown',  
  'emily.brown@example.com',
  '+91-7654321098',
  'third_trimester',
  '2025-11-10'::date,
  (SELECT id FROM public.packages WHERE name = 'comprehensive' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.patients_new WHERE email = 'emily.brown@example.com');

-- Payments table will be handled in separate migration
