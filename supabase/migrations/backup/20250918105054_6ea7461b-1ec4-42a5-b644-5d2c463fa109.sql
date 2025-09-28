-- Create enum types for better data consistency
CREATE TYPE care_plan_status AS ENUM ('active', 'completed', 'on_hold', 'cancelled');
CREATE TYPE communication_type AS ENUM ('alert', 'update', 'request', 'feedback');
CREATE TYPE symptom_severity AS ENUM ('mild', 'moderate', 'severe');
CREATE TYPE mood_rating AS ENUM ('very_poor', 'poor', 'neutral', 'good', 'excellent');

-- Core CarePlan table - stores interventions from each role
CREATE TABLE public.care_plans (
  plan_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  provider_id UUID NOT NULL,
  provider_role user_role NOT NULL,
  plan_type TEXT NOT NULL, -- 'medical', 'nutrition', 'fitness', 'therapy', 'delivery'
  title TEXT NOT NULL,
  description TEXT,
  goals JSONB DEFAULT '[]'::jsonb,
  interventions JSONB DEFAULT '[]'::jsonb,
  restrictions JSONB DEFAULT '{}'::jsonb, -- dietary, fitness, medical restrictions
  status care_plan_status DEFAULT 'active',
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  progress_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Communication Log table - tracks cross-role data sharing
CREATE TABLE public.communication_logs (
  log_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  from_provider_id UUID NOT NULL,
  from_provider_role user_role NOT NULL,
  to_provider_id UUID,
  to_provider_role user_role,
  communication_type communication_type NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  priority INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high, 4=urgent
  read_at TIMESTAMP WITH TIME ZONE,
  response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Patient Symptom Tracking
CREATE TABLE public.patient_symptoms (
  symptom_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  symptom_type TEXT NOT NULL, -- 'nausea', 'fatigue', 'back_pain', 'swelling', etc.
  severity symptom_severity NOT NULL,
  description TEXT,
  triggers TEXT, -- what might have caused it
  relief_methods TEXT, -- what helped
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Patient Mood/Emotional Tracking
CREATE TABLE public.patient_mood_logs (
  mood_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  mood_rating mood_rating NOT NULL,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  notes TEXT,
  concerns TEXT, -- specific worries or anxieties
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Patient Feedback on Services
CREATE TABLE public.patient_feedback (
  feedback_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  provider_id UUID NOT NULL,
  provider_role user_role NOT NULL,
  service_type TEXT NOT NULL, -- 'meal', 'yoga_session', 'therapy_session', 'consultation'
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  suggestions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.care_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for care_plans
CREATE POLICY "Providers can create their own care plans" 
ON public.care_plans 
FOR INSERT 
WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Providers can update their own care plans" 
ON public.care_plans 
FOR UPDATE 
USING (provider_id = auth.uid());

CREATE POLICY "Providers can view their own care plans" 
ON public.care_plans 
FOR SELECT 
USING (provider_id = auth.uid());

CREATE POLICY "Patients can view their care plans" 
ON public.care_plans 
FOR SELECT 
USING (patient_id = auth.uid());

-- Doctors can view all care plans for their patients
CREATE POLICY "Doctors can view all patient care plans" 
ON public.care_plans 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = auth.uid() 
    AND role = 'doctor'
  ) AND patient_id IN (
    SELECT patient_id FROM appointments_new 
    WHERE provider_id = auth.uid()
  )
);

-- RLS Policies for communication_logs
CREATE POLICY "Providers can send communications" 
ON public.communication_logs 
FOR INSERT 
WITH CHECK (from_provider_id = auth.uid());

CREATE POLICY "Providers can view sent communications" 
ON public.communication_logs 
FOR SELECT 
USING (from_provider_id = auth.uid());

CREATE POLICY "Providers can view received communications" 
ON public.communication_logs 
FOR SELECT 
USING (to_provider_id = auth.uid());

CREATE POLICY "Providers can update received communications" 
ON public.communication_logs 
FOR UPDATE 
USING (to_provider_id = auth.uid());

CREATE POLICY "Patients can view their communications" 
ON public.communication_logs 
FOR SELECT 
USING (patient_id = auth.uid());

-- RLS Policies for patient_symptoms
CREATE POLICY "Patients can manage their symptoms" 
ON public.patient_symptoms 
FOR ALL 
USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view patient symptoms" 
ON public.patient_symptoms 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = auth.uid() 
    AND role = 'doctor'
  ) AND patient_id IN (
    SELECT patient_id FROM appointments_new 
    WHERE provider_id = auth.uid()
  )
);

CREATE POLICY "Yoga trainers can view patient symptoms" 
ON public.patient_symptoms 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = auth.uid() 
    AND role = 'yoga'
  ) AND patient_id IN (
    SELECT patient_id FROM yoga_sessions 
    WHERE trainer_id = auth.uid()
  )
);

-- RLS Policies for patient_mood_logs
CREATE POLICY "Patients can manage their mood logs" 
ON public.patient_mood_logs 
FOR ALL 
USING (patient_id = auth.uid());

CREATE POLICY "Therapists can view patient mood logs" 
ON public.patient_mood_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = auth.uid() 
    AND role = 'therapist'
  ) AND patient_id IN (
    SELECT patient_id FROM therapy_sessions 
    WHERE therapist_id = auth.uid()
  )
);

CREATE POLICY "Doctors can view patient mood logs if mental health flag exists" 
ON public.patient_mood_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = auth.uid() 
    AND role = 'doctor'
  ) AND patient_id IN (
    SELECT patient_id FROM appointments_new 
    WHERE provider_id = auth.uid()
  )
);

-- RLS Policies for patient_feedback
CREATE POLICY "Patients can create feedback" 
ON public.patient_feedback 
FOR INSERT 
WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can view their feedback" 
ON public.patient_feedback 
FOR SELECT 
USING (patient_id = auth.uid());

CREATE POLICY "Providers can view feedback about them" 
ON public.patient_feedback 
FOR SELECT 
USING (provider_id = auth.uid());

-- Create trigger for updating timestamps
CREATE TRIGGER update_care_plans_updated_at
BEFORE UPDATE ON public.care_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_care_plans_patient_id ON public.care_plans(patient_id);
CREATE INDEX idx_care_plans_provider_id ON public.care_plans(provider_id);
CREATE INDEX idx_communication_logs_patient_id ON public.communication_logs(patient_id);
CREATE INDEX idx_communication_logs_to_provider ON public.communication_logs(to_provider_id);
CREATE INDEX idx_patient_symptoms_patient_id ON public.patient_symptoms(patient_id);
CREATE INDEX idx_patient_mood_logs_patient_id ON public.patient_mood_logs(patient_id);
CREATE INDEX idx_patient_feedback_provider_id ON public.patient_feedback(provider_id);