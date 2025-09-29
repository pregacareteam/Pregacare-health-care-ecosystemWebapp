import { supabase } from '../integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '../integrations/supabase/types';

// Types for better type safety
export type Patient = Tables<'patients_new'> & {
  user: Tables<'users'>;
  package?: Tables<'packages'>;
};

export type Provider = Tables<'users'> & {
  doctor?: Tables<'doctors'>;
  nutritionist?: Tables<'nutritionists'>;
  therapist?: Tables<'therapists'>;
  yoga_trainer?: Tables<'yoga_trainers'>;
};

export type Appointment = Tables<'appointments_new'> & {
  patient: Patient;
  provider: Provider;
};

export type Package = Tables<'packages'>;
export type Payment = Tables<'payments'>;

// Patient Management Service
export class PatientService {
  // Get all patients with their user data and packages
  static async getAllPatients(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients_new')
      .select(`
        *,
        user:users!patients_new_patient_id_fkey(*),
        package:packages!patients_new_package_id_fkey(*)
      `);
    
    if (error) throw error;
    return data || [];
  }

  // Create new patient
  static async createPatient(patientData: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    emergency_contact?: string;
    expected_delivery_date?: string;
    pregnancy_stage?: string;
    package_id?: string;
  }): Promise<Patient> {
    try {
      // First create user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          name: patientData.name,
          email: patientData.email,
          phone: patientData.phone,
          role: 'patient'
        })
        .select()
        .single();

      if (userError) throw userError;

      // Generate Pregacare ID
      const pregacareId = `PGC${Date.now().toString().slice(-6)}`;

      // Then create patient profile
      const { data: patient, error: patientError } = await supabase
        .from('patients_new')
        .insert({
          patient_id: userData.user_id,
          address: patientData.address,
          emergency_contact: patientData.emergency_contact,
          expected_delivery_date: patientData.expected_delivery_date,
          pregnancy_stage: patientData.pregnancy_stage,
          package_id: patientData.package_id,
          pregacare_id: pregacareId,
          profile_completed: false
        })
        .select(`
          *,
          user:users!patients_new_patient_id_fkey(*),
          package:packages!patients_new_package_id_fkey(*)
        `)
        .single();

      if (patientError) throw patientError;

      return patient;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  // Update patient
  static async updatePatient(patientId: string, updates: Partial<TablesUpdate<'patients_new'>>): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients_new')
      .update(updates)
      .eq('patient_id', patientId)
      .select(`
        *,
        user:users!patients_new_patient_id_fkey(*),
        package:packages!patients_new_package_id_fkey(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  // Delete patient
  static async deletePatient(patientId: string): Promise<void> {
    const { error } = await supabase
      .from('patients_new')
      .delete()
      .eq('patient_id', patientId);

    if (error) throw error;
  }
}

// Provider Management Service
export class ProviderService {
  // Get all providers
  static async getAllProviders(): Promise<Provider[]> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        doctor:doctors!doctors_doctor_id_fkey(*),
        nutritionist:nutritionists!nutritionists_nutritionist_id_fkey(*),
        therapist:therapists!therapists_therapist_id_fkey(*),
        yoga_trainer:yoga_trainers!yoga_trainers_trainer_id_fkey(*)
      `)
      .in('role', ['doctor', 'nutritionist', 'therapist', 'yoga']);

    if (error) throw error;
    return data || [];
  }

  // Create new provider
  static async createProvider(providerData: {
    name: string;
    email: string;
    phone: string;
    role: 'doctor' | 'nutritionist' | 'therapist' | 'yoga';
    specialization?: string;
    license_number?: string;
    experience_years?: number;
  }): Promise<Provider> {
    try {
      // First create user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          name: providerData.name,
          email: providerData.email,
          phone: providerData.phone,
          role: providerData.role
        })
        .select()
        .single();

      if (userError) throw userError;

      // Then create role-specific profile
      let roleSpecificData;
      
      switch (providerData.role) {
        case 'doctor':
          const { data: doctorData, error: doctorError } = await supabase
            .from('doctors')
            .insert({
              doctor_id: userData.user_id,
              specialization: providerData.specialization,
              license_number: providerData.license_number,
              consultation_fee: 500, // Default fee
              profile_completed: false
            })
            .select()
            .single();
          
          if (doctorError) throw doctorError;
          roleSpecificData = { doctor: doctorData };
          break;

        case 'nutritionist':
          const { data: nutritionistData, error: nutritionistError } = await supabase
            .from('nutritionists')
            .insert({
              nutritionist_id: userData.user_id,
              specialization: providerData.specialization,
              profile_completed: false
            })
            .select()
            .single();
          
          if (nutritionistError) throw nutritionistError;
          roleSpecificData = { nutritionist: nutritionistData };
          break;

        case 'therapist':
          const { data: therapistData, error: therapistError } = await supabase
            .from('therapists')
            .insert({
              therapist_id: userData.user_id,
              type: providerData.specialization || 'general',
              license_number: providerData.license_number,
              profile_completed: false
            })
            .select()
            .single();
          
          if (therapistError) throw therapistError;
          roleSpecificData = { therapist: therapistData };
          break;

        case 'yoga':
          const { data: yogaData, error: yogaError } = await supabase
            .from('yoga_trainers')
            .insert({
              trainer_id: userData.user_id,
              session_types: providerData.specialization || 'prenatal',
              certification_details: providerData.license_number,
              profile_completed: false
            })
            .select()
            .single();
          
          if (yogaError) throw yogaError;
          roleSpecificData = { yoga_trainer: yogaData };
          break;
      }

      return { ...userData, ...roleSpecificData };
    } catch (error) {
      console.error('Error creating provider:', error);
      throw error;
    }
  }
}

// Appointment Management Service
export class AppointmentService {
  // Get all appointments
  static async getAllAppointments(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments_new')
      .select(`
        *,
        patient:patients_new!appointments_new_patient_id_fkey(
          *,
          user:users!patients_new_patient_id_fkey(*)
        ),
        provider:users!appointments_new_provider_id_fkey(*)
      `)
      .order('date_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Create new appointment
  static async createAppointment(appointmentData: {
    patient_id: string;
    provider_id: string;
    provider_role: 'doctor' | 'nutritionist' | 'therapist' | 'yoga';
    date_time: string;
    type?: string;
    notes?: string;
  }): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments_new')
      .insert({
        patient_id: appointmentData.patient_id,
        provider_id: appointmentData.provider_id,
        provider_role: appointmentData.provider_role,
        date_time: appointmentData.date_time,
        type: appointmentData.type,
        notes: appointmentData.notes,
        status: 'scheduled'
      })
      .select(`
        *,
        patient:patients_new!appointments_new_patient_id_fkey(
          *,
          user:users!patients_new_patient_id_fkey(*)
        ),
        provider:users!appointments_new_provider_id_fkey(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  // Update appointment status
  static async updateAppointmentStatus(appointmentId: string, status: 'scheduled' | 'completed' | 'cancelled'): Promise<void> {
    const { error } = await supabase
      .from('appointments_new')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('appointment_id', appointmentId);

    if (error) throw error;
  }
}

// Package Management Service
export class PackageService {
  // Get all packages
  static async getAllPackages(): Promise<Package[]> {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('price', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Create new package
  static async createPackage(packageData: {
    name: 'basic' | 'medium' | 'comprehensive';
    price: number;
    duration_months: number;
    included_services: any;
  }): Promise<Package> {
    const { data, error } = await supabase
      .from('packages')
      .insert(packageData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update package
  static async updatePackage(packageId: string, updates: Partial<TablesUpdate<'packages'>>): Promise<Package> {
    const { data, error } = await supabase
      .from('packages')
      .update(updates)
      .eq('package_id', packageId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete package
  static async deletePackage(packageId: string): Promise<void> {
    const { error } = await supabase
      .from('packages')
      .delete()
      .eq('package_id', packageId);

    if (error) throw error;
  }
}

// Payment Management Service
export class PaymentService {
  // Get all payments with related data
  static async getAllPayments() {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        patient:patients_new!payments_patient_id_fkey(
          *,
          user:users!patients_new_patient_id_fkey(*)
        ),
        package:packages!payments_package_id_fkey(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Create new payment
  static async createPayment(paymentData: {
    patient_id: string;
    package_id: string;
    amount: number;
    payment_method: string;
  }): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        ...paymentData,
        payment_status: 'pending',
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update payment status
  static async updatePaymentStatus(
    paymentId: string, 
    status: 'pending' | 'completed' | 'failed' | 'refunded'
  ): Promise<void> {
    const { error } = await supabase
      .from('payments')
      .update({ 
        payment_status: status, 
        updated_at: new Date().toISOString() 
      })
      .eq('payment_id', paymentId);

    if (error) throw error;
  }

  // Get payment statistics
  static async getPaymentStats(): Promise<{
    totalRevenue: number;
    pendingPayments: number;
    completedPayments: number;
    failedPayments: number;
  }> {
    const { data, error } = await supabase
      .from('payments')
      .select('amount, payment_status');

    if (error) throw error;

    const stats = data?.reduce((acc, payment) => {
      acc.totalRevenue += payment.payment_status === 'completed' ? payment.amount : 0;
      
      switch (payment.payment_status) {
        case 'pending':
          acc.pendingPayments++;
          break;
        case 'completed':
          acc.completedPayments++;
          break;
        case 'failed':
          acc.failedPayments++;
          break;
      }
      
      return acc;
    }, {
      totalRevenue: 0,
      pendingPayments: 0,
      completedPayments: 0,
      failedPayments: 0
    });

    return stats || {
      totalRevenue: 0,
      pendingPayments: 0,
      completedPayments: 0,
      failedPayments: 0
    };
  }
}

// Analytics Service
export class AnalyticsService {
  // Get dashboard statistics
  static async getDashboardStats() {
    try {
      const [patients, providers, appointments, payments] = await Promise.all([
        PatientService.getAllPatients(),
        ProviderService.getAllProviders(),
        AppointmentService.getAllAppointments(),
        PaymentService.getPaymentStats()
      ]);

      return {
        totalPatients: patients.length,
        activePatients: patients.filter(p => p.profile_completed).length,
        totalProviders: providers.length,
        totalAppointments: appointments.length,
        upcomingAppointments: appointments.filter(a => 
          new Date(a.date_time) > new Date() && a.status === 'scheduled'
        ).length,
        ...payments
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Get monthly revenue data
  static async getMonthlyRevenue(): Promise<Array<{ month: string; revenue: number }>> {
    const { data, error } = await supabase
      .from('payments')
      .select('amount, created_at')
      .eq('payment_status', 'completed')
      .gte('created_at', new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    // Group by month
    const monthlyData = data?.reduce((acc, payment) => {
      const month = new Date(payment.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += payment.amount;
      
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlyData || {}).map(([month, revenue]) => ({
      month,
      revenue
    }));
  }
}

// Communication Service
export class CommunicationService {
  // Send message to provider/patient
  static async sendMessage(messageData: {
    patient_id: string;
    from_provider_id: string;
    from_provider_role: 'doctor' | 'nutritionist' | 'therapist' | 'yoga';
    subject: string;
    message: string;
    communication_type: 'alert' | 'update' | 'request' | 'feedback';
    to_provider_id?: string;
    to_provider_role?: 'doctor' | 'nutritionist' | 'therapist' | 'yoga';
    priority?: number;
  }) {
    const { data, error } = await supabase
      .from('communication_logs')
      .insert(messageData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get messages for patient
  static async getPatientMessages(patientId: string) {
    const { data, error } = await supabase
      .from('communication_logs')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

// Real-time subscriptions for live updates
export class RealtimeService {
  // Subscribe to patient updates
  static subscribeToPatients(callback: (payload: any) => void) {
    return supabase
      .channel('patients_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'patients_new' },
        callback
      )
      .subscribe();
  }

  // Subscribe to appointment updates
  static subscribeToAppointments(callback: (payload: any) => void) {
    return supabase
      .channel('appointments_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'appointments_new' },
        callback
      )
      .subscribe();
  }

  // Subscribe to payment updates
  static subscribeToPayments(callback: (payload: any) => void) {
    return supabase
      .channel('payments_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'payments' },
        callback
      )
      .subscribe();
  }
}