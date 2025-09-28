-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_patient_provider(patient_id UUID, provider_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
  IF provider_role = 'doctor' THEN
    RETURN EXISTS (
      SELECT 1 FROM appointments_new 
      WHERE appointments_new.patient_id = is_patient_provider.patient_id 
      AND provider_id = auth.uid()
    );
  ELSIF provider_role = 'nutritionist' THEN
    RETURN EXISTS (
      SELECT 1 FROM diet_plans 
      WHERE diet_plans.patient_id = is_patient_provider.patient_id 
      AND nutritionist_id = auth.uid()
    );
  ELSIF provider_role = 'therapist' THEN
    RETURN EXISTS (
      SELECT 1 FROM therapy_sessions 
      WHERE therapy_sessions.patient_id = is_patient_provider.patient_id 
      AND therapist_id = auth.uid()
    );
  ELSIF provider_role = 'yoga' THEN
    RETURN EXISTS (
      SELECT 1 FROM yoga_sessions 
      WHERE yoga_sessions.patient_id = is_patient_provider.patient_id 
      AND trainer_id = auth.uid()
    );
  ELSIF provider_role = 'delivery' THEN
    RETURN EXISTS (
      SELECT 1 FROM food_orders 
      WHERE food_orders.patient_id = is_patient_provider.patient_id 
      AND partner_id = auth.uid()
    );
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update RLS policies for enhanced role-based access

-- Enhanced diet_plans policies for nutritionist access to doctor notes
DROP POLICY IF EXISTS "Nutritionists can view their diet plans" ON public.diet_plans;
CREATE POLICY "Nutritionists can view their diet plans" 
ON public.diet_plans 
FOR SELECT 
USING (
  nutritionist_id = auth.uid() OR
  (get_user_role() = 'nutritionist' AND 
   is_patient_provider(patient_id, 'nutritionist'))
);

-- Allow nutritionists to see doctor restrictions via care_plans
CREATE POLICY "Nutritionists can view medical restrictions" 
ON public.care_plans 
FOR SELECT 
USING (
  (get_user_role() = 'nutritionist' AND 
   provider_role = 'doctor' AND 
   plan_type = 'medical' AND
   is_patient_provider(patient_id, 'nutritionist'))
);

-- Allow yoga trainers to see doctor restrictions
CREATE POLICY "Yoga trainers can view medical restrictions" 
ON public.care_plans 
FOR SELECT 
USING (
  (get_user_role() = 'yoga' AND 
   provider_role = 'doctor' AND 
   plan_type = 'medical' AND
   is_patient_provider(patient_id, 'yoga'))
);

-- Allow therapists to see relevant doctor notes
CREATE POLICY "Therapists can view mental health related medical notes" 
ON public.care_plans 
FOR SELECT 
USING (
  (get_user_role() = 'therapist' AND 
   provider_role = 'doctor' AND 
   plan_type = 'medical' AND
   (restrictions ? 'mental_health' OR interventions ? 'mental_health') AND
   is_patient_provider(patient_id, 'therapist'))
);

-- Food delivery partners can see nutrition plans
CREATE POLICY "Food partners can view assigned diet plans" 
ON public.diet_plans 
FOR SELECT 
USING (
  get_user_role() = 'delivery' AND 
  is_patient_provider(patient_id, 'delivery')
);

CREATE POLICY "Food partners can view nutrition care plans" 
ON public.care_plans 
FOR SELECT 
USING (
  (get_user_role() = 'delivery' AND 
   provider_role = 'nutritionist' AND 
   plan_type = 'nutrition' AND
   is_patient_provider(patient_id, 'delivery'))
);

-- Enhanced food_orders policies
DROP POLICY IF EXISTS "Food partners can view their orders" ON public.food_orders;
CREATE POLICY "Food partners can view assigned orders" 
ON public.food_orders 
FOR SELECT 
USING (
  partner_id = auth.uid() OR
  (get_user_role() = 'nutritionist' AND 
   is_patient_provider(patient_id, 'nutritionist'))
);

-- Nutritionists can see food delivery status
CREATE POLICY "Nutritionists can view food delivery status" 
ON public.food_orders 
FOR SELECT 
USING (
  get_user_role() = 'nutritionist' AND 
  is_patient_provider(patient_id, 'nutritionist')
);

-- Enhanced medical records access
CREATE POLICY "Nutritionists can view relevant medical records" 
ON public.medical_records_new 
FOR SELECT 
USING (
  get_user_role() = 'nutritionist' AND 
  is_patient_provider(patient_id, 'nutritionist') AND
  record_type IN ('lab_report', 'dietary_assessment', 'medical_history')
);

-- Enhanced prescriptions access  
CREATE POLICY "Nutritionists can view dietary related prescriptions" 
ON public.prescriptions 
FOR SELECT 
USING (
  get_user_role() = 'nutritionist' AND 
  is_patient_provider(patient_user_id, 'nutritionist') AND
  (medication_name ILIKE '%vitamin%' OR 
   medication_name ILIKE '%iron%' OR 
   medication_name ILIKE '%folic%' OR
   medication_name ILIKE '%calcium%' OR
   instructions ILIKE '%diet%')
);

-- Create function to send cross-role alerts
CREATE OR REPLACE FUNCTION public.send_provider_alert(
  patient_id_param UUID,
  to_role user_role,
  subject_param TEXT,
  message_param TEXT,
  priority_param INTEGER DEFAULT 2
)
RETURNS UUID AS $$
DECLARE
  to_provider_id UUID;
  log_id UUID;
BEGIN
  -- Find the provider of the specified role for this patient
  IF to_role = 'doctor' THEN
    SELECT provider_id INTO to_provider_id 
    FROM appointments_new 
    WHERE patient_id = patient_id_param AND provider_role = 'doctor' 
    LIMIT 1;
  ELSIF to_role = 'nutritionist' THEN
    SELECT nutritionist_id INTO to_provider_id 
    FROM diet_plans 
    WHERE patient_id = patient_id_param 
    LIMIT 1;
  ELSIF to_role = 'therapist' THEN
    SELECT therapist_id INTO to_provider_id 
    FROM therapy_sessions 
    WHERE patient_id = patient_id_param 
    LIMIT 1;
  ELSIF to_role = 'yoga' THEN
    SELECT trainer_id INTO to_provider_id 
    FROM yoga_sessions 
    WHERE patient_id = patient_id_param 
    LIMIT 1;
  ELSIF to_role = 'delivery' THEN
    SELECT partner_id INTO to_provider_id 
    FROM food_orders 
    WHERE patient_id = patient_id_param 
    LIMIT 1;
  END IF;

  IF to_provider_id IS NOT NULL THEN
    INSERT INTO public.communication_logs (
      patient_id, from_provider_id, from_provider_role, to_provider_id, to_provider_role,
      communication_type, subject, message, priority
    ) VALUES (
      patient_id_param, auth.uid(), get_user_role(), to_provider_id, to_role,
      'alert', subject_param, message_param, priority_param
    ) RETURNING log_id INTO log_id;
  END IF;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;