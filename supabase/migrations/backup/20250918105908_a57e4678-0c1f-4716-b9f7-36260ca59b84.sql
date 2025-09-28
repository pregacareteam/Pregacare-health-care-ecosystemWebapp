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