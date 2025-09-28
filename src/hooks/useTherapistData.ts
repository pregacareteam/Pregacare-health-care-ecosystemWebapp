import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TherapySession {
  session_id: string;
  patient_id: string;
  session_date: string;
  session_type: string;
  mode: string;
  notes?: string;
  patient?: {
    name: string;
    pregacare_id?: string;
  };
}

interface PatientCommunication {
  log_id: string;
  patient_id: string;
  from_provider_id: string;
  from_provider_role: string;
  communication_type: string;
  subject: string;
  message: string;
  created_at: string;
  read_at?: string;
  patient?: {
    name: string;
  };
}

export function useTherapistData(therapistId: string) {
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [communications, setCommunications] = useState<PatientCommunication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('therapy_sessions')
        .select('*')
        .eq('therapist_id', therapistId)
        .order('session_date', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching therapy sessions:', error);
    }
  };

  const fetchCommunications = async () => {
    try {
      const { data, error } = await supabase
        .from('communication_logs')
        .select('*')
        .eq('to_provider_id', therapistId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommunications(data || []);
    } catch (error) {
      console.error('Error fetching communications:', error);
    }
  };

  const scheduleSession = async (sessionData: {
    patient_id: string;
    session_date: string;
    session_type: string;
    mode: string;
    notes?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('therapy_sessions')
        .insert({
          ...sessionData,
          therapist_id: therapistId
        });

      if (error) throw error;
      await fetchSessions();
    } catch (error) {
      console.error('Error scheduling session:', error);
      throw error;
    }
  };

  const updateSessionNotes = async (sessionId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('therapy_sessions')
        .update({ notes })
        .eq('session_id', sessionId);

      if (error) throw error;
      await fetchSessions();
    } catch (error) {
      console.error('Error updating session notes:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (therapistId) {
      Promise.all([fetchSessions(), fetchCommunications()]).finally(() => {
        setLoading(false);
      });
    }
  }, [therapistId]);

  return {
    sessions,
    communications,
    loading,
    scheduleSession,
    updateSessionNotes,
    refetch: () => Promise.all([fetchSessions(), fetchCommunications()])
  };
}