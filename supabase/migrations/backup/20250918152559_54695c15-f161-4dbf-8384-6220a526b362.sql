-- Add Pregacare ID validation and ecosystem constraints

-- Add pregacare_id to patients table
ALTER TABLE public.patients_new 
ADD COLUMN pregacare_id TEXT UNIQUE;

-- Add pregacare_id to patients (legacy table)
ALTER TABLE public.patients 
ADD COLUMN pregacare_id TEXT UNIQUE;

-- Create Pregacare patients registry table
CREATE TABLE public.pregacare_patients (
  pregacare_id TEXT PRIMARY KEY,
  patient_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  package_subscription BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on pregacare_patients
ALTER TABLE public.pregacare_patients ENABLE ROW LEVEL SECURITY;

-- Create policies for pregacare_patients
CREATE POLICY "Users can view their own Pregacare registration"
ON public.pregacare_patients 
FOR SELECT 
USING (patient_user_id = auth.uid());

CREATE POLICY "Users can create their own Pregacare registration"
ON public.pregacare_patients 
FOR INSERT 
WITH CHECK (patient_user_id = auth.uid());

CREATE POLICY "Providers can view Pregacare patient registry"
ON public.pregacare_patients 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('doctor', 'nutritionist', 'therapist', 'yoga', 'food_partner')
  )
);

-- Create function to validate Pregacare ID
CREATE OR REPLACE FUNCTION public.validate_pregacare_patient(patient_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.pregacare_patients 
    WHERE patient_user_id = patient_id_param 
    AND status = 'active'
  );
END;
$$;

-- Create function to get Pregacare ID
CREATE OR REPLACE FUNCTION public.get_pregacare_id(patient_user_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pregacare_id_result TEXT;
BEGIN
  SELECT pregacare_id INTO pregacare_id_result
  FROM public.pregacare_patients 
  WHERE patient_user_id = patient_user_id_param;
  
  RETURN pregacare_id_result;
END;
$$;

-- Add trigger to update timestamp
CREATE TRIGGER update_pregacare_patients_updated_at
BEFORE UPDATE ON public.pregacare_patients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update existing policies to include Pregacare validation
DROP POLICY IF EXISTS "Doctors can create patients" ON public.patients;
DROP POLICY IF EXISTS "Doctors can update their patients" ON public.patients;
DROP POLICY IF EXISTS "Doctors can view their own patients" ON public.patients;

-- New policies with Pregacare validation
CREATE POLICY "Doctors can create Pregacare patients"
ON public.patients 
FOR INSERT 
WITH CHECK (
  doctor_id = auth.uid() 
  AND pregacare_id IS NOT NULL
);

CREATE POLICY "Doctors can update their Pregacare patients"
ON public.patients 
FOR UPDATE 
USING (
  doctor_id = auth.uid() 
  AND pregacare_id IS NOT NULL
);

CREATE POLICY "Doctors can view their Pregacare patients"
ON public.patients 
FOR SELECT 
USING (
  doctor_id = auth.uid() 
  AND pregacare_id IS NOT NULL
);

-- Insert some sample Pregacare patients for testing
INSERT INTO public.pregacare_patients (pregacare_id, patient_user_id, status, package_subscription) VALUES
('PGC-2024-001', '40a7bc87-aab5-4966-a4f8-b4e7c80242bf', 'active', true);

-- Add comment for clarity
COMMENT ON TABLE public.pregacare_patients IS 'Registry of patients registered with Pregacare ecosystem';
COMMENT ON COLUMN public.pregacare_patients.pregacare_id IS 'Unique Pregacare patient identifier (format: PGC-YYYY-XXX)';
COMMENT ON FUNCTION public.validate_pregacare_patient IS 'Validates if a patient is registered with Pregacare and active';