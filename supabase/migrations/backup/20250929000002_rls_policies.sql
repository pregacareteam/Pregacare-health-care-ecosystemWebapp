-- ============================================================================
-- PREGACARE RLS POLICIES - COMPREHENSIVE SECURITY MODEL
-- ============================================================================

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can view their own profile and profiles of users they interact with
CREATE POLICY "users_select_own_or_related" ON public.users
  FOR SELECT
  USING (
    auth.uid() = auth_user_id OR
    -- Admins can see all users
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    ) OR
    -- Providers can see their assigned patients
    EXISTS (
      SELECT 1 FROM public.patients p 
      WHERE p.user_id = users.id 
      AND (p.assigned_doctor_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
           p.assigned_nutritionist_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
           p.assigned_therapist_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
           p.assigned_yoga_instructor_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()))
    )
  );

-- Users can update their own profile
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- Only admins can insert new users
CREATE POLICY "users_insert_admin" ON public.users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- PATIENTS TABLE POLICIES
-- ============================================================================

-- Patients can view their own record
-- Providers can view their assigned patients
-- Admins can view all patients
CREATE POLICY "patients_select_authorized" ON public.patients
  FOR SELECT
  USING (
    -- Own patient record
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    -- Assigned providers
    assigned_doctor_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    assigned_nutritionist_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    assigned_therapist_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    assigned_yoga_instructor_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    -- Admins
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- Patients can update their own record (limited fields)
-- Assigned providers can update patient records
-- Admins can update all
CREATE POLICY "patients_update_authorized" ON public.patients
  FOR UPDATE
  USING (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    assigned_doctor_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    assigned_nutritionist_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    assigned_therapist_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    assigned_yoga_instructor_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- Only admins and doctors can create new patients
CREATE POLICY "patients_insert_authorized" ON public.patients
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() AND role IN ('admin', 'doctor')
    )
  );

-- ============================================================================
-- PROVIDERS TABLE POLICIES
-- ============================================================================

-- Providers can view their own record and other providers they collaborate with
CREATE POLICY "providers_select_own_or_related" ON public.providers
  FOR SELECT
  USING (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    -- Admins can see all providers
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    ) OR
    -- Providers working with same patients can see each other
    EXISTS (
      SELECT 1 FROM public.patients p, public.users u
      WHERE u.auth_user_id = auth.uid()
      AND (p.assigned_doctor_id = u.id OR 
           p.assigned_nutritionist_id = u.id OR 
           p.assigned_therapist_id = u.id OR 
           p.assigned_yoga_instructor_id = u.id)
      AND (p.assigned_doctor_id = providers.user_id OR 
           p.assigned_nutritionist_id = providers.user_id OR 
           p.assigned_therapist_id = providers.user_id OR 
           p.assigned_yoga_instructor_id = providers.user_id)
    )
  );

-- Providers can update their own record
CREATE POLICY "providers_update_own" ON public.providers
  FOR UPDATE
  USING (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- Only admins can create new providers
CREATE POLICY "providers_insert_admin" ON public.providers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- APPOINTMENTS TABLE POLICIES
-- ============================================================================

-- Patients can see their appointments
-- Providers can see their appointments
-- Admins can see all
CREATE POLICY "appointments_select_authorized" ON public.appointments
  FOR SELECT
  USING (
    patient_id IN (
      SELECT p.id FROM public.patients p, public.users u
      WHERE p.user_id = u.id AND u.auth_user_id = auth.uid()
    ) OR
    provider_id IN (
      SELECT pr.id FROM public.providers pr, public.users u
      WHERE pr.user_id = u.id AND u.auth_user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- Patients and providers can update their appointments
CREATE POLICY "appointments_update_authorized" ON public.appointments
  FOR UPDATE
  USING (
    patient_id IN (
      SELECT p.id FROM public.patients p, public.users u
      WHERE p.user_id = u.id AND u.auth_user_id = auth.uid()
    ) OR
    provider_id IN (
      SELECT pr.id FROM public.providers pr, public.users u
      WHERE pr.user_id = u.id AND u.auth_user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- Patients and providers can create appointments
CREATE POLICY "appointments_insert_authorized" ON public.appointments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() 
      AND u.role IN ('patient', 'doctor', 'radiologist', 'lab_technician', 'nutritionist', 'therapist', 'yoga_instructor', 'admin')
    )
  );

-- ============================================================================
-- MEDICAL RECORDS TABLE POLICIES
-- ============================================================================

-- Patients can see their records
-- Providers involved in the record can see it
-- Assigned providers to the patient can see it
CREATE POLICY "medical_records_select_authorized" ON public.medical_records
  FOR SELECT
  USING (
    -- Patient's own records
    patient_id IN (
      SELECT p.id FROM public.patients p, public.users u
      WHERE p.user_id = u.id AND u.auth_user_id = auth.uid()
    ) OR
    -- Provider who created the record
    provider_id IN (
      SELECT pr.id FROM public.providers pr, public.users u
      WHERE pr.user_id = u.id AND u.auth_user_id = auth.uid()
    ) OR
    -- Assigned providers to the patient
    patient_id IN (
      SELECT p.id FROM public.patients p, public.users u
      WHERE u.auth_user_id = auth.uid() 
      AND (p.assigned_doctor_id = u.id OR 
           p.assigned_nutritionist_id = u.id OR 
           p.assigned_therapist_id = u.id OR 
           p.assigned_yoga_instructor_id = u.id)
    ) OR
    -- Admins
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- Only providers can create and update medical records
CREATE POLICY "medical_records_insert_providers" ON public.medical_records
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() 
      AND u.role IN ('doctor', 'radiologist', 'lab_technician', 'admin')
    )
  );

CREATE POLICY "medical_records_update_providers" ON public.medical_records
  FOR UPDATE
  USING (
    provider_id IN (
      SELECT pr.id FROM public.providers pr, public.users u
      WHERE pr.user_id = u.id AND u.auth_user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- ============================================================================
-- PRESCRIPTIONS TABLE POLICIES
-- ============================================================================

-- Patients, doctors, and pharmacies can see relevant prescriptions
CREATE POLICY "prescriptions_select_authorized" ON public.prescriptions
  FOR SELECT
  USING (
    -- Patient's own prescriptions
    patient_id IN (
      SELECT p.id FROM public.patients p, public.users u
      WHERE p.user_id = u.id AND u.auth_user_id = auth.uid()
    ) OR
    -- Doctor who prescribed
    doctor_id IN (
      SELECT pr.id FROM public.providers pr, public.users u
      WHERE pr.user_id = u.id AND u.auth_user_id = auth.uid()
    ) OR
    -- Assigned pharmacy
    pharmacy_id IN (
      SELECT pr.id FROM public.providers pr, public.users u
      WHERE pr.user_id = u.id AND u.auth_user_id = auth.uid()
    ) OR
    -- Admins
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- Only doctors can create prescriptions
CREATE POLICY "prescriptions_insert_doctors" ON public.prescriptions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role IN ('doctor', 'admin')
    )
  );

-- Doctors and pharmacies can update prescriptions
CREATE POLICY "prescriptions_update_authorized" ON public.prescriptions
  FOR UPDATE
  USING (
    doctor_id IN (
      SELECT pr.id FROM public.providers pr, public.users u
      WHERE pr.user_id = u.id AND u.auth_user_id = auth.uid()
    ) OR
    pharmacy_id IN (
      SELECT pr.id FROM public.providers pr, public.users u
      WHERE pr.user_id = u.id AND u.auth_user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- ============================================================================
-- DIET PLANS TABLE POLICIES
-- ============================================================================

-- Patients, nutritionists, and food services can see relevant diet plans
CREATE POLICY "diet_plans_select_authorized" ON public.diet_plans
  FOR SELECT
  USING (
    patient_id IN (
      SELECT p.id FROM public.patients p, public.users u
      WHERE p.user_id = u.id AND u.auth_user_id = auth.uid()
    ) OR
    nutritionist_id IN (
      SELECT pr.id FROM public.providers pr, public.users u
      WHERE pr.user_id = u.id AND u.auth_user_id = auth.uid()
    ) OR
    food_service_id IN (
      SELECT pr.id FROM public.providers pr, public.users u
      WHERE pr.user_id = u.id AND u.auth_user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- Only nutritionists can create and update diet plans
CREATE POLICY "diet_plans_insert_nutritionists" ON public.diet_plans
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role IN ('nutritionist', 'admin')
    )
  );

CREATE POLICY "diet_plans_update_authorized" ON public.diet_plans
  FOR UPDATE
  USING (
    nutritionist_id IN (
      SELECT pr.id FROM public.providers pr, public.users u
      WHERE pr.user_id = u.id AND u.auth_user_id = auth.uid()
    ) OR
    food_service_id IN (
      SELECT pr.id FROM public.providers pr, public.users u
      WHERE pr.user_id = u.id AND u.auth_user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- ============================================================================
-- THERAPY SESSIONS TABLE POLICIES
-- ============================================================================

-- Patients and their providers can see therapy sessions
CREATE POLICY "therapy_sessions_select_authorized" ON public.therapy_sessions
  FOR SELECT
  USING (
    patient_id IN (
      SELECT p.id FROM public.patients p, public.users u
      WHERE p.user_id = u.id AND u.auth_user_id = auth.uid()
    ) OR
    provider_id IN (
      SELECT pr.id FROM public.providers pr, public.users u
      WHERE pr.user_id = u.id AND u.auth_user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- Therapists and yoga instructors can create sessions
CREATE POLICY "therapy_sessions_insert_providers" ON public.therapy_sessions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() 
      AND u.role IN ('therapist', 'yoga_instructor', 'admin')
    )
  );

-- Providers and patients can update sessions
CREATE POLICY "therapy_sessions_update_authorized" ON public.therapy_sessions
  FOR UPDATE
  USING (
    patient_id IN (
      SELECT p.id FROM public.patients p, public.users u
      WHERE p.user_id = u.id AND u.auth_user_id = auth.uid()
    ) OR
    provider_id IN (
      SELECT pr.id FROM public.providers pr, public.users u
      WHERE pr.user_id = u.id AND u.auth_user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- ============================================================================
-- CONVERSATIONS TABLE POLICIES
-- ============================================================================

-- Users can see conversations they are part of
CREATE POLICY "conversations_select_participants" ON public.conversations
  FOR SELECT
  USING (
    (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) = ANY(participants) OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- Users can create conversations
CREATE POLICY "conversations_insert_authenticated" ON public.conversations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Participants can update conversations
CREATE POLICY "conversations_update_participants" ON public.conversations
  FOR UPDATE
  USING (
    (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) = ANY(participants) OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- ============================================================================
-- MESSAGES TABLE POLICIES
-- ============================================================================

-- Users can see messages in conversations they are part of
CREATE POLICY "messages_select_participants" ON public.messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) = ANY(participants)
    ) OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- Users can create messages in conversations they are part of
CREATE POLICY "messages_insert_participants" ON public.messages
  FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) = ANY(participants)
    )
  );

-- Users can update their own messages
CREATE POLICY "messages_update_own" ON public.messages
  FOR UPDATE
  USING (
    sender_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================================

-- Users can see their own notifications
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT
  USING (
    recipient_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- System can create notifications
CREATE POLICY "notifications_insert_system" ON public.notifications
  FOR INSERT
  WITH CHECK (true); -- Allow system to create notifications

-- Users can update their own notifications (mark as read, etc.)
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE
  USING (
    recipient_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- ============================================================================
-- TASKS TABLE POLICIES
-- ============================================================================

-- Users can see tasks assigned to them or created by them
CREATE POLICY "tasks_select_assigned_or_created" ON public.tasks
  FOR SELECT
  USING (
    assigned_to IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    assigned_by IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- Authorized users can create tasks
CREATE POLICY "tasks_insert_authorized" ON public.tasks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('doctor', 'nutritionist', 'therapist', 'admin')
    )
  );

-- Assigned users can update tasks
CREATE POLICY "tasks_update_assigned" ON public.tasks
  FOR UPDATE
  USING (
    assigned_to IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    assigned_by IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- ============================================================================
-- PAYMENTS TABLE POLICIES
-- ============================================================================

-- Patients can see their own payments
-- Admins can see all payments
CREATE POLICY "payments_select_authorized" ON public.payments
  FOR SELECT
  USING (
    patient_id IN (
      SELECT p.id FROM public.patients p, public.users u
      WHERE p.user_id = u.id AND u.auth_user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- System and admins can create payments
CREATE POLICY "payments_insert_system" ON public.payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- Admins can update payments
CREATE POLICY "payments_update_admin" ON public.payments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.auth_user_id = auth.uid() AND u.role = 'admin'
    )
  );

-- ============================================================================
-- SUBSCRIPTION PACKAGES - PUBLIC READ
-- ============================================================================

-- Everyone can read subscription packages
CREATE POLICY "subscription_packages_select_all" ON public.subscription_packages
  FOR SELECT
  USING (true);

-- Only admins can modify subscription packages
CREATE POLICY "subscription_packages_insert_admin" ON public.subscription_packages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "subscription_packages_update_admin" ON public.subscription_packages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );