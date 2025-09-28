import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Patient {
  id: string;
  doctor_id: string;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  profile_picture?: string;
  pregnancy_stage: string;
  due_date: string;
  risk_status: 'normal' | 'medium' | 'high';
  medical_history: any;
  emergency_contact: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  provider_id: string;
  patient_id: string;
  patient_user_id: string;
  appointment_date: string;
  duration_minutes: number;
  type: 'video_call' | 'in_person' | 'chat' | 'follow_up';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  consultation_fee?: number;
  created_at: string;
  updated_at: string;
  patients?: Patient;
}

export function useDoctorData(providerId: string) {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('doctor_id', providerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Type assertion to ensure proper typing
      setPatients((data as Patient[]) || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patients data.",
        variant: "destructive",
      });
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (*)
        `)
        .eq('provider_id', providerId)
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      // Type assertion to ensure proper typing
      setAppointments((data as Appointment[]) || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments data.",
        variant: "destructive",
      });
    }
  };

  const createPrescription = async (prescription: any) => {
    try {
      const prescriptionData = {
        provider_id: providerId,
        patient_id: prescription.patient_id,
        medication_name: prescription.medications[0]?.name || '',
        dosage: prescription.medications[0]?.dosage || '',
        frequency: prescription.medications[0]?.frequency || '',
        duration: prescription.medications[0]?.duration || '',
        instructions: prescription.general_instructions || '',
      };

      const { error } = await supabase
        .from('prescriptions')
        .insert([prescriptionData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prescription created successfully.",
      });
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast({
        title: "Error",
        description: "Failed to create prescription.",
        variant: "destructive",
      });
    }
  };

  const createReferral = async (referral: any) => {
    try {
      const referralData = {
        provider_id: providerId,
        patient_id: referral.patient_id,
        referred_to_type: referral.referred_to_type,
        reason: referral.reason,
        notes: referral.notes,
        status: 'pending',
      };

      const { error } = await supabase
        .from('referrals')
        .insert([referralData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Referral created successfully.",
      });
    } catch (error) {
      console.error('Error creating referral:', error);
      toast({
        title: "Error",
        description: "Failed to create referral.",
        variant: "destructive",
      });
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) throw error;

      await fetchAppointments();
      toast({
        title: "Success",
        description: "Appointment status updated.",
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPatients(), fetchAppointments()]);
      setLoading(false);
    };

    if (providerId) {
      loadData();
    }
  }, [providerId]);

  return {
    patients,
    appointments,
    loading,
    createPrescription,
    createReferral,
    updateAppointmentStatus,
    refetch: () => {
      fetchPatients();
      fetchAppointments();
    }
  };
}