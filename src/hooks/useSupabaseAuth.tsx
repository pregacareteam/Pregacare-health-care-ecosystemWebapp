import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User, Patient, Provider } from '@/types/pregacare';

interface AuthContextType {
  user: User | null;
  patient: Patient | null;
  provider: Provider | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ user: SupabaseUser | null; error: any }>;
  signIn: (email: string, password: string) => Promise<{ user: SupabaseUser | null; error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        await loadUserData(session.user.id);
      } else {
        setUser(null);
        setPatient(null);
        setProvider(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      setLoading(true);

      // Load user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      setUser(userData);

      // Load role-specific data
      if (userData?.role === 'patient') {
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (patientError && patientError.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('Error loading patient data:', patientError);
        }
        
        setPatient(patientData || null);
      } else if (['doctor', 'nutritionist', 'yoga_trainer', 'therapist'].includes(userData?.role)) {
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (providerError && providerError.code !== 'PGRST116') {
          console.error('Error loading provider data:', providerError);
        }

        setProvider(providerData || null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role
          }
        }
      });

      if (authError) return { user: null, error: authError };

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email,
            name: userData.name || '',
            phone: userData.phone,
            role: userData.role || 'patient',
            profile_picture: userData.profilePicture,
            is_active: true,
            profile_completed: false
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          return { user: authData.user, error: profileError };
        }

        // Create role-specific profile
        if (userData.role === 'patient') {
          await createPatientProfile(authData.user.id, userData);
        } else if (['doctor', 'nutritionist', 'yoga_trainer', 'therapist'].includes(userData.role || '')) {
          await createProviderProfile(authData.user.id, userData);
        }
      }

      return { user: authData.user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return { user: data.user, error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) return { error: 'No user logged in' };

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (!error) {
        setUser(prev => prev ? { ...prev, ...updates } : null);
      }

      return { error };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error };
    }
  };

  const createPatientProfile = async (userId: string, userData: Partial<User>) => {
    try {
      const { error } = await supabase
        .from('patients')
        .insert({
          user_id: userId,
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone,
          pregnancy_stage: 'first_trimester', // Default
          risk_status: 'normal',
          medical_history: {},
          assigned_providers: {}
        });

      if (error) {
        console.error('Error creating patient profile:', error);
      }
    } catch (error) {
      console.error('Error creating patient profile:', error);
    }
  };

  const createProviderProfile = async (userId: string, userData: Partial<User>) => {
    try {
      const { error } = await supabase
        .from('providers')
        .insert({
          user_id: userId,
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone,
          provider_type: userData.role as 'doctor' | 'nutritionist' | 'yoga_trainer' | 'therapist',
          specialization: 'General', // Default
          experience_years: 0,
          education: [],
          certifications: [],
          languages: ['English'],
          availability: {},
          rating: 0,
          total_reviews: 0,
          is_verified: false
        });

      if (error) {
        console.error('Error creating provider profile:', error);
      }
    } catch (error) {
      console.error('Error creating provider profile:', error);
    }
  };

  const value: AuthContextType = {
    user,
    patient,
    provider,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}