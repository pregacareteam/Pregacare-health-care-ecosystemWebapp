-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  profile_picture TEXT,
  pregnancy_stage TEXT CHECK (pregnancy_stage IN ('first_trimester', 'second_trimester', 'third_trimester', 'postpartum')),
  due_date DATE,
  risk_status TEXT CHECK (risk_status IN ('normal', 'medium', 'high')) DEFAULT 'normal',
  medical_history JSONB DEFAULT '{}',
  emergency_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  type TEXT CHECK (type IN ('video_call', 'in_person', 'chat', 'follow_up')) NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
  notes TEXT,
  consultation_fee DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prescriptions table
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id),
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  instructions TEXT,
  prescribed_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medical_records table
CREATE TABLE public.medical_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL,
  record_type TEXT CHECK (record_type IN ('scan', 'lab_report', 'prescription', 'notes', 'vitals')) NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,
  content JSONB DEFAULT '{}',
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  referred_to_type TEXT CHECK (referred_to_type IN ('nutritionist', 'therapist', 'yoga_trainer')) NOT NULL,
  referred_to_id UUID,
  reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'completed', 'declined')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Create policies for patients table
CREATE POLICY "Doctors can view their own patients" 
ON public.patients 
FOR SELECT 
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can create patients" 
ON public.patients 
FOR INSERT 
WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update their patients" 
ON public.patients 
FOR UPDATE 
USING (doctor_id = auth.uid());

-- Create policies for appointments table
CREATE POLICY "Doctors can view their appointments" 
ON public.appointments 
FOR SELECT 
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can create appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update their appointments" 
ON public.appointments 
FOR UPDATE 
USING (doctor_id = auth.uid());

-- Create policies for prescriptions table
CREATE POLICY "Doctors can view their prescriptions" 
ON public.prescriptions 
FOR SELECT 
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can create prescriptions" 
ON public.prescriptions 
FOR INSERT 
WITH CHECK (doctor_id = auth.uid());

-- Create policies for medical_records table
CREATE POLICY "Doctors can view their patients' records" 
ON public.medical_records 
FOR SELECT 
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can create medical records" 
ON public.medical_records 
FOR INSERT 
WITH CHECK (doctor_id = auth.uid());

-- Create policies for referrals table
CREATE POLICY "Doctors can view their referrals" 
ON public.referrals 
FOR SELECT 
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can create referrals" 
ON public.referrals 
FOR INSERT 
WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update their referrals" 
ON public.referrals 
FOR UPDATE 
USING (doctor_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON public.patients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at
BEFORE UPDATE ON public.referrals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for testing
INSERT INTO public.patients (doctor_id, name, email, phone, date_of_birth, pregnancy_stage, due_date, risk_status, medical_history) VALUES
(gen_random_uuid(), 'Sarah Johnson', 'sarah.johnson@email.com', '+1234567890', '1990-05-15', 'second_trimester', '2024-06-15', 'normal', '{"conditions": ["none"], "allergies": ["none"]}'),
(gen_random_uuid(), 'Maria Garcia', 'maria.garcia@email.com', '+1234567891', '1988-08-22', 'third_trimester', '2024-04-20', 'high', '{"conditions": ["gestational_diabetes", "hypertension"], "allergies": ["penicillin"]}'),
(gen_random_uuid(), 'Emily Chen', 'emily.chen@email.com', '+1234567892', '1992-12-03', 'first_trimester', '2024-09-10', 'normal', '{"conditions": ["none"], "allergies": ["shellfish"]}');