-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_patient_provider(patient_id UUID, provider_role user_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    CASE 
      WHEN provider_role = 'doctor' THEN
        SELECT 1 FROM appointments_new 
        WHERE appointments_new.patient_id = is_patient_provider.patient_id 
        AND provider_id = auth.uid()
      WHEN provider_role = 'nutritionist' THEN
        SELECT 1 FROM diet_plans 
        WHERE diet_plans.patient_id = is_patient_provider.patient_id 
        AND nutritionist_id = auth.uid()
      WHEN provider_role = 'therapist' THEN
        SELECT 1 FROM therapy_sessions 
        WHERE therapy_sessions.patient_id = is_patient_provider.patient_id 
        AND therapist_id = auth.uid()
      WHEN provider_role = 'yoga' THEN
        SELECT 1 FROM yoga_sessions 
        WHERE yoga_sessions.patient_id = is_patient_provider.patient_id 
        AND trainer_id = auth.uid()
      WHEN provider_role = 'delivery' THEN
        SELECT 1 FROM food_orders 
        WHERE food_orders.patient_id = is_patient_provider.patient_id 
        AND partner_id = auth.uid()
      ELSE FALSE
    END
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

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
  SELECT 
    CASE 
      WHEN to_role = 'doctor' THEN 
        (SELECT provider_id FROM appointments_new WHERE patient_id = patient_id_param AND provider_role = 'doctor' LIMIT 1)
      WHEN to_role = 'nutritionist' THEN 
        (SELECT nutritionist_id FROM diet_plans WHERE patient_id = patient_id_param LIMIT 1)
      WHEN to_role = 'therapist' THEN 
        (SELECT therapist_id FROM therapy_sessions WHERE patient_id = patient_id_param LIMIT 1)
      WHEN to_role = 'yoga' THEN 
        (SELECT trainer_id FROM yoga_sessions WHERE patient_id = patient_id_param LIMIT 1)
      WHEN to_role = 'delivery' THEN 
        (SELECT partner_id FROM food_orders WHERE patient_id = patient_id_param LIMIT 1)
    END INTO to_provider_id;

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

-- Add sample data for the role-based system
INSERT INTO public.care_plans (patient_id, provider_id, provider_role, plan_type, title, description, restrictions, goals) VALUES
-- Doctor care plan with restrictions for other providers
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'doctor', 'medical', 
 'Gestational Diabetes Management', 
 'Comprehensive care plan for managing gestational diabetes during pregnancy',
 '{"dietary": ["low_sugar", "controlled_carbs"], "fitness": ["low_impact_only", "monitor_heart_rate"], "mental_health": ["stress_monitoring"]}',
 '["maintain_blood_sugar_levels", "healthy_weight_gain", "prepare_for_delivery"]'),

-- Nutritionist care plan
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'nutritionist', 'nutrition',
 'Gestational Diabetes Diet Plan',
 'Specialized nutrition plan for managing blood sugar levels',
 '{}',
 '["stabilize_blood_sugar", "ensure_proper_nutrition", "healthy_weight_management"]'),

-- Therapist care plan  
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', 'therapist', 'therapy',
 'Pregnancy Anxiety Management',
 'Therapy sessions to address pregnancy-related anxiety and stress',
 '{}',
 '["reduce_anxiety_levels", "develop_coping_strategies", "prepare_mentally_for_motherhood"]');

-- Add sample patient symptoms and mood logs
INSERT INTO public.patient_symptoms (patient_id, symptom_type, severity, description, triggers, relief_methods) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'nausea', 'moderate', 'Morning sickness, especially strong in the mornings', 'empty stomach, strong smells', 'ginger tea, small frequent meals'),
('550e8400-e29b-41d4-a716-446655440000', 'fatigue', 'mild', 'General tiredness throughout the day', 'lack of sleep, stress', 'afternoon naps, early bedtime'),
('550e8400-e29b-41d4-a716-446655440000', 'back_pain', 'moderate', 'Lower back pain, especially when standing', 'long periods standing, poor posture', 'pregnancy pillow, gentle stretching');

INSERT INTO public.patient_mood_logs (patient_id, mood_rating, energy_level, stress_level, sleep_quality, notes, concerns) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'good', 7, 4, 6, 'Feeling positive about the pregnancy progress', 'Worried about managing diabetes during pregnancy'),
('550e8400-e29b-41d4-a716-446655440000', 'neutral', 5, 6, 5, 'Having some ups and downs', 'Concerned about baby health with the diabetes diagnosis'),
('550e8400-e29b-41d4-a716-446655440000', 'good', 8, 3, 7, 'Great session with therapist today', 'Feeling more confident about managing everything');

-- Add sample communication logs
INSERT INTO public.communication_logs (patient_id, from_provider_id, from_provider_role, to_provider_id, to_provider_role, communication_type, subject, message, priority) VALUES
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'yoga', '550e8400-e29b-41d4-a716-446655440001', 'doctor', 'alert', 
 'Patient reported discomfort during session',
 'Sarah mentioned experiencing some shortness of breath during today prenatal yoga session. Recommend medical evaluation.', 3),

('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', 'therapist', '550e8400-e29b-41d4-a716-446655440001', 'doctor', 'update',
 'Mental health assessment update',
 'Patient showing good progress with anxiety management. Stress levels have decreased significantly over the past two weeks.', 2),

('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'doctor', '550e8400-e29b-41d4-a716-446655440002', 'nutritionist', 'request',
 'Dietary restrictions update needed',
 'Patient diagnosed with gestational diabetes. Please adjust meal plan to include low glycemic index foods and carbohydrate counting.', 3);