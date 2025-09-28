import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CommunicationLog {
  log_id: string;
  patient_id: string;
  from_provider_id: string;
  from_provider_role: string;
  to_provider_id?: string;
  to_provider_role?: string;
  communication_type: string;
  subject: string;
  message: string;
  priority?: number;
  read_at?: string;
  response?: string;
  responded_at?: string;
  created_at: string;
}

export interface ProviderNote {
  from_provider_name: string;
  from_provider_role: string;
  subject: string;
  message: string;
  created_at: string;
  priority?: number;
  response?: string;
  responded_at?: string;
}

export function useCommunication(providerId: string, providerRole: string) {
  const { toast } = useToast();
  const [communications, setCommunications] = useState<CommunicationLog[]>([]);
  const [sentCommunications, setSentCommunications] = useState<CommunicationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReceivedCommunications = async () => {
    try {
      const { data, error } = await supabase
        .from('communication_logs')
        .select('*')
        .eq('to_provider_id', providerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommunications(data || []);
    } catch (error) {
      console.error('Error fetching communications:', error);
      toast({
        title: "Error",
        description: "Failed to load communications.",
        variant: "destructive",
      });
    }
  };

  const fetchSentCommunications = async () => {
    try {
      const { data, error } = await supabase
        .from('communication_logs')
        .select('*')
        .eq('from_provider_id', providerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSentCommunications(data || []);
    } catch (error) {
      console.error('Error fetching sent communications:', error);
    }
  };

  const sendMessage = async (messageData: {
    patient_id: string;
    to_provider_role: string;
    subject: string;
    message: string;
    priority?: number;
  }) => {
    try {
      const { error } = await supabase.rpc('send_provider_alert', {
        patient_id_param: messageData.patient_id,
        to_role: messageData.to_provider_role as any,
        subject_param: messageData.subject,
        message_param: messageData.message,
        priority_param: messageData.priority || 2
      });

      if (error) throw error;

      await fetchSentCommunications();
      toast({
        title: "Success",
        description: "Message sent successfully.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('communication_logs')
        .update({ read_at: new Date().toISOString() })
        .eq('log_id', logId);

      if (error) throw error;
      await fetchReceivedCommunications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const respondToMessage = async (logId: string, response: string) => {
    try {
      const { error } = await supabase
        .from('communication_logs')
        .update({ 
          response: response,
          responded_at: new Date().toISOString()
        })
        .eq('log_id', logId);

      if (error) throw error;

      await fetchReceivedCommunications();
      toast({
        title: "Success",
        description: "Response sent successfully.",
      });
    } catch (error) {
      console.error('Error responding to message:', error);
      toast({
        title: "Error",
        description: "Failed to send response.",
        variant: "destructive",
      });
    }
  };

  const getPatientNotes = async (patientId: string): Promise<ProviderNote[]> => {
    try {
      const { data, error } = await supabase
        .from('communication_logs')
        .select(`
          *,
          from_provider:users!communication_logs_from_provider_id_fkey(name)
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((comm: any) => ({
        from_provider_name: comm.from_provider?.name || 'Unknown Provider',
        from_provider_role: comm.from_provider_role,
        subject: comm.subject,
        message: comm.message,
        created_at: comm.created_at,
        priority: comm.priority,
        response: comm.response,
        responded_at: comm.responded_at
      }));
    } catch (error) {
      console.error('Error fetching patient notes:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadCommunications = async () => {
      setLoading(true);
      await Promise.all([
        fetchReceivedCommunications(),
        fetchSentCommunications()
      ]);
      setLoading(false);
    };

    if (providerId) {
      loadCommunications();
    }
  }, [providerId]);

  return {
    communications,
    sentCommunications,
    loading,
    sendMessage,
    markAsRead,
    respondToMessage,
    getPatientNotes,
    refetch: () => {
      fetchReceivedCommunications();
      fetchSentCommunications();
    }
  };
}