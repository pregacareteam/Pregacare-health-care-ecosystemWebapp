-- Add patient role and update schema for multi-provider communication

-- First, let's create a providers table to handle all types of service providers
CREATE TABLE public.providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('doctor', 'nutritionist', 'yoga', 'therapist', 'delivery')),
  specialization TEXT,
  experience_years INTEGER,
  certification TEXT,
  bio TEXT,
  profile_picture TEXT,
  availability JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on providers
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

-- Create policies for providers
CREATE POLICY "Providers can view their own profile" 
ON public.providers 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Providers can update their own profile" 
ON public.providers 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Providers can create their own profile" 
ON public.providers 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Everyone can view provider profiles" 
ON public.providers 
FOR SELECT 
USING (true);

-- Create a patient_profiles table for patient-specific information
CREATE TABLE public.patient_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  profile_picture TEXT,
  pregnancy_stage TEXT,
  due_date DATE,
  risk_status TEXT DEFAULT 'normal' CHECK (risk_status IN ('normal', 'medium', 'high')),
  medical_history JSONB DEFAULT '{}',
  emergency_contact TEXT,
  address TEXT,
  insurance_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on patient_profiles
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for patient_profiles
CREATE POLICY "Patients can view their own profile" 
ON public.patient_profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Patients can update their own profile" 
ON public.patient_profiles 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Patients can create their own profile" 
ON public.patient_profiles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Providers can view their patients' profiles" 
ON public.patient_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a 
    JOIN public.providers p ON p.id = a.provider_id 
    WHERE a.patient_id = patient_profiles.id AND p.user_id = auth.uid()
  )
);

-- Update appointments table to work with providers instead of just doctors
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_doctor_id_fkey;
ALTER TABLE public.appointments RENAME COLUMN doctor_id TO provider_id;
ALTER TABLE public.appointments ADD COLUMN patient_user_id UUID;

-- Update appointments to reference providers and patient_profiles
-- We'll keep patient_id for backward compatibility but add patient_user_id for new system

-- Drop old RLS policies for appointments
DROP POLICY IF EXISTS "Doctors can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Doctors can update their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Doctors can view their appointments" ON public.appointments;

-- Create new RLS policies for appointments
CREATE POLICY "Providers can create appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.providers WHERE id = provider_id AND user_id = auth.uid())
);

CREATE POLICY "Providers can update their appointments" 
ON public.appointments 
FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.providers WHERE id = provider_id AND user_id = auth.uid())
);

CREATE POLICY "Providers can view their appointments" 
ON public.appointments 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.providers WHERE id = provider_id AND user_id = auth.uid())
);

CREATE POLICY "Patients can view their appointments" 
ON public.appointments 
FOR SELECT 
USING (patient_user_id = auth.uid());

CREATE POLICY "Patients can create their appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (patient_user_id = auth.uid());

-- Update prescriptions table
ALTER TABLE public.prescriptions DROP CONSTRAINT IF EXISTS prescriptions_doctor_id_fkey;
ALTER TABLE public.prescriptions RENAME COLUMN doctor_id TO provider_id;
ALTER TABLE public.prescriptions ADD COLUMN patient_user_id UUID;

-- Drop old RLS policies for prescriptions
DROP POLICY IF EXISTS "Doctors can create prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctors can view their prescriptions" ON public.prescriptions;

-- Create new RLS policies for prescriptions
CREATE POLICY "Providers can create prescriptions" 
ON public.prescriptions 
FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.providers WHERE id = provider_id AND user_id = auth.uid())
);

CREATE POLICY "Providers can view their prescriptions" 
ON public.prescriptions 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.providers WHERE id = provider_id AND user_id = auth.uid())
);

CREATE POLICY "Patients can view their prescriptions" 
ON public.prescriptions 
FOR SELECT 
USING (patient_user_id = auth.uid());

-- Update referrals table
ALTER TABLE public.referrals DROP CONSTRAINT IF EXISTS referrals_doctor_id_fkey;
ALTER TABLE public.referrals RENAME COLUMN doctor_id TO provider_id;
ALTER TABLE public.referrals ADD COLUMN patient_user_id UUID;

-- Drop old RLS policies for referrals
DROP POLICY IF EXISTS "Doctors can create referrals" ON public.referrals;
DROP POLICY IF EXISTS "Doctors can update their referrals" ON public.referrals;
DROP POLICY IF EXISTS "Doctors can view their referrals" ON public.referrals;

-- Create new RLS policies for referrals
CREATE POLICY "Providers can create referrals" 
ON public.referrals 
FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.providers WHERE id = provider_id AND user_id = auth.uid())
);

CREATE POLICY "Providers can update their referrals" 
ON public.referrals 
FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.providers WHERE id = provider_id AND user_id = auth.uid())
);

CREATE POLICY "Providers can view their referrals" 
ON public.referrals 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.providers WHERE id = provider_id AND user_id = auth.uid())
);

CREATE POLICY "Patients can view their referrals" 
ON public.referrals 
FOR SELECT 
USING (patient_user_id = auth.uid());

-- Update medical_records table
ALTER TABLE public.medical_records DROP CONSTRAINT IF EXISTS medical_records_doctor_id_fkey;
ALTER TABLE public.medical_records RENAME COLUMN doctor_id TO provider_id;
ALTER TABLE public.medical_records ADD COLUMN patient_user_id UUID;

-- Drop old RLS policies for medical_records
DROP POLICY IF EXISTS "Doctors can create medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Doctors can view their patients' records" ON public.medical_records;

-- Create new RLS policies for medical_records
CREATE POLICY "Providers can create medical records" 
ON public.medical_records 
FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.providers WHERE id = provider_id AND user_id = auth.uid())
);

CREATE POLICY "Providers can view their patients' records" 
ON public.medical_records 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.providers WHERE id = provider_id AND user_id = auth.uid())
);

CREATE POLICY "Patients can view their medical records" 
ON public.medical_records 
FOR SELECT 
USING (patient_user_id = auth.uid());

-- Create triggers for updated_at columns
CREATE TRIGGER update_providers_updated_at
BEFORE UPDATE ON public.providers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_profiles_updated_at
BEFORE UPDATE ON public.patient_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample providers
INSERT INTO public.providers (user_id, name, email, provider_type, specialization, experience_years) VALUES
('00000000-0000-0000-0000-000000000001', 'Dr. Sarah Johnson', 'sarah.johnson@pregacare.com', 'doctor', 'Obstetrics & Gynecology', 12),
('00000000-0000-0000-0000-000000000002', 'Lisa Chen', 'lisa.chen@pregacare.com', 'nutritionist', 'Prenatal Nutrition', 8),
('00000000-0000-0000-0000-000000000003', 'Maya Patel', 'maya.patel@pregacare.com', 'yoga', 'Prenatal Yoga', 6),
('00000000-0000-0000-0000-000000000004', 'Dr. Emily Rodriguez', 'emily.rodriguez@pregacare.com', 'therapist', 'Perinatal Mental Health', 10),
('00000000-0000-0000-0000-000000000005', 'Mike Wilson', 'mike.wilson@pregacare.com', 'delivery', 'Medical Supplies', 5);

-- Insert sample patient profile
INSERT INTO public.patient_profiles (user_id, name, email, pregnancy_stage, due_date, risk_status) VALUES
('00000000-0000-0000-0000-000000000006', 'Jessica Davis', 'jessica.davis@email.com', 'Second Trimester', '2024-06-15', 'normal');