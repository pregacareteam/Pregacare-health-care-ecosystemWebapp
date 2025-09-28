-- Step 1: Create providers and patient_profiles tables first

-- Create a providers table to handle all types of service providers
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