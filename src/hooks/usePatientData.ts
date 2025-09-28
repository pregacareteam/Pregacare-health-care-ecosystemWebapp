import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { pregacareDB } from "@/lib/storage";
import { Patient, Appointment, Prescription, MedicalRecord, DietPlan, FoodOrder, TherapySession, YogaSession, Payment, Provider } from "@/types/pregacare";

export function usePatientData(patientUserId?: string) {
  const { toast } = useToast();
  const [patientProfile, setPatientProfile] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [foodOrders, setFoodOrders] = useState<FoodOrder[]>([]);
  const [therapySessions, setTherapySessions] = useState<TherapySession[]>([]);
  const [yogaSessions, setYogaSessions] = useState<YogaSession[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPatientProfile = async () => {
    try {
      if (!patientUserId) return;
      
      const patient = pregacareDB.patients.findByUserId(patientUserId);
      if (patient) {
        setPatientProfile(patient);
      }
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      toast({
        title: "Error",
        description: "Failed to load patient profile.",
        variant: "destructive",
      });
    }
  };

  const fetchAppointments = async () => {
    try {
      if (!patientProfile) return;
      
      const patientAppointments = pregacareDB.appointments.findByPatient(patientProfile.id);
      setAppointments(patientAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments.",
        variant: "destructive",
      });
    }
  };

  const fetchPrescriptions = async () => {
    try {
      if (!patientProfile) return;
      
      const patientPrescriptions = pregacareDB.prescriptions.findByPatient(patientProfile.id);
      setPrescriptions(patientPrescriptions);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast({
        title: "Error",
        description: "Failed to load prescriptions.",
        variant: "destructive",
      });
    }
  };

  const fetchMedicalRecords = async () => {
    try {
      if (!patientProfile) return;
      
      const records = pregacareDB.medicalRecords.findByPatient(patientProfile.id);
      setMedicalRecords(records);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      toast({
        title: "Error",
        description: "Failed to load medical records.",
        variant: "destructive",
      });
    }
  };

  const fetchDietPlans = async () => {
    try {
      if (!patientProfile) return;
      
      const plans = pregacareDB.dietPlans.findByPatient(patientProfile.id);
      setDietPlans(plans);
    } catch (error) {
      console.error('Error fetching diet plans:', error);
      toast({
        title: "Error",
        description: "Failed to load diet plans.",
        variant: "destructive",
      });
    }
  };

  const fetchFoodOrders = async () => {
    try {
      if (!patientProfile) return;
      
      const orders = pregacareDB.foodOrders.findByPatient(patientProfile.id);
      setFoodOrders(orders);
    } catch (error) {
      console.error('Error fetching food orders:', error);
      toast({
        title: "Error",
        description: "Failed to load food orders.",
        variant: "destructive",
      });
    }
  };

  const fetchTherapySessions = async () => {
    try {
      if (!patientProfile) return;
      
      const sessions = pregacareDB.therapySessions.findByPatient(patientProfile.id);
      setTherapySessions(sessions);
    } catch (error) {
      console.error('Error fetching therapy sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load therapy sessions.",
        variant: "destructive",
      });
    }
  };

  const fetchYogaSessions = async () => {
    try {
      if (!patientProfile) return;
      
      const sessions = pregacareDB.yogaSessions.findByPatient(patientProfile.id);
      setYogaSessions(sessions);
    } catch (error) {
      console.error('Error fetching yoga sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load yoga sessions.",
        variant: "destructive",
      });
    }
  };

  const fetchPayments = async () => {
    try {
      if (!patientProfile) return;
      
      const patientPayments = pregacareDB.payments.findByPatient(patientProfile.id);
      setPayments(patientPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to load payment history.",
        variant: "destructive",
      });
    }
  };

  const fetchProviders = async () => {
    try {
      const allProviders = pregacareDB.providers.findActive();
      setProviders(allProviders);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const bookAppointment = async (appointmentData: {
    providerId: string;
    providerType: 'doctor' | 'nutritionist' | 'yoga_trainer' | 'therapist';
    appointmentDate: string;
    duration?: number;
    type?: 'video_call' | 'in_person' | 'phone_call';
    title: string;
    description?: string;
    notes?: string;
  }) => {
    try {
      if (!patientProfile) {
        throw new Error('No patient profile found');
      }

      const newAppointment = pregacareDB.appointments.create({
        patientId: patientProfile.id,
        providerId: appointmentData.providerId,
        providerType: appointmentData.providerType,
        appointmentDate: appointmentData.appointmentDate,
        duration: appointmentData.duration || 60,
        type: appointmentData.type || 'video_call',
        status: 'scheduled',
        title: appointmentData.title,
        description: appointmentData.description,
        notes: appointmentData.notes,
        reminders: {
          email: true,
          sms: true,
          push: true
        }
      });

      await fetchAppointments();
      toast({
        title: "Success",
        description: "Appointment booked successfully.",
      });

      return newAppointment;
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Error",
        description: "Failed to book appointment.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const orderFood = async (orderData: {
    deliveryPartnerId?: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    items: Array<{
      name: string;
      quantity: number;
      calories: number;
      price: number;
      specialInstructions?: string;
    }>;
    deliveryDate: string;
  }) => {
    try {
      if (!patientProfile || !patientProfile.address) {
        throw new Error('Patient profile or address not found');
      }

      const totalAmount = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const newOrder = pregacareDB.foodOrders.create({
        patientId: patientProfile.id,
        deliveryPartnerId: orderData.deliveryPartnerId,
        orderDate: new Date().toISOString(),
        deliveryDate: orderData.deliveryDate,
        mealType: orderData.mealType,
        items: orderData.items,
        totalAmount,
        deliveryAddress: patientProfile.address,
        status: 'placed',
        payment: {
          method: 'card',
          amount: totalAmount,
          status: 'pending'
        }
      });

      await fetchFoodOrders();
      toast({
        title: "Success",
        description: "Food order placed successfully.",
      });

      return newOrder;
    } catch (error) {
      console.error('Error placing food order:', error);
      toast({
        title: "Error",
        description: "Failed to place food order.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePatientProfile = async (updates: Partial<Patient>) => {
    try {
      if (!patientProfile) {
        throw new Error('No patient profile found');
      }

      const updatedProfile = pregacareDB.patients.update(patientProfile.id, updates);
      if (updatedProfile) {
        setPatientProfile(updatedProfile);
        toast({
          title: "Success",
          description: "Profile updated successfully.",
        });
      }

      return updatedProfile;
    } catch (error) {
      console.error('Error updating patient profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchPatientProfile();
    };

    if (patientUserId) {
      loadData().finally(() => setLoading(false));
    }
  }, [patientUserId]);

  useEffect(() => {
    const loadPatientData = async () => {
      if (patientProfile) {
        await Promise.all([
          fetchAppointments(),
          fetchPrescriptions(),
          fetchMedicalRecords(),
          fetchDietPlans(),
          fetchFoodOrders(),
          fetchTherapySessions(),
          fetchYogaSessions(),
          fetchPayments(),
          fetchProviders()
        ]);
      }
    };

    loadPatientData();
  }, [patientProfile]);

  const refetch = async () => {
    setLoading(true);
    await fetchPatientProfile();
    if (patientProfile) {
      await Promise.all([
        fetchAppointments(),
        fetchPrescriptions(),
        fetchMedicalRecords(),
        fetchDietPlans(),
        fetchFoodOrders(),
        fetchTherapySessions(),
        fetchYogaSessions(),
        fetchPayments(),
        fetchProviders()
      ]);
    }
    setLoading(false);
  };

  return {
    patientProfile,
    appointments,
    prescriptions,
    medicalRecords,
    dietPlans,
    foodOrders,
    therapySessions,
    yogaSessions,
    payments,
    providers,
    loading,
    bookAppointment,
    orderFood,
    updatePatientProfile,
    refetch
  };
}