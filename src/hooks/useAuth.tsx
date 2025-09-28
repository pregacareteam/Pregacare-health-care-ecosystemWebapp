import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Patient, Provider } from '@/types/pregacare';
import { pregacareDB } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  patient: Patient | null;
  provider: Provider | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ user?: User; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ user?: User; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const currentUser = pregacareDB.users.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      fetchUserProfile(currentUser);
    }
    setLoading(false);
  }, []);

  const fetchUserProfile = async (currentUser: User) => {
    try {
      if (currentUser.role === 'patient') {
        const patientProfile = pregacareDB.patients.findByUserId(currentUser.id);
        setPatient(patientProfile);
      } else {
        const providerProfile = pregacareDB.providers.findByUserId(currentUser.id);
        setProvider(providerProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>): Promise<{ user?: User; error?: string }> => {
    try {
      setLoading(true);
      
      // Check if user already exists
      const existingUser = pregacareDB.users.findByEmail(email);
      if (existingUser) {
        return { error: 'User with this email already exists' };
      }

      // Create new user
      const newUser = pregacareDB.users.create({
        email,
        name: userData.name || '',
        phone: userData.phone,
        role: userData.role || 'patient',
        profilePicture: userData.profilePicture,
        isActive: true
      });

      // Create corresponding profile based on role
      if (newUser.role === 'patient') {
        const patientData = pregacareDB.patients.create({
          userId: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          pregnancyStage: 'first_trimester',
          riskStatus: 'normal',
          medicalHistory: {
            conditions: [],
            allergies: [],
            medications: [],
            surgeries: []
          },
          assignedProviders: {}
        });
        setPatient(patientData);
      } else {
        const providerData = pregacareDB.providers.create({
          userId: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          providerType: newUser.role as Provider['providerType'],
          availability: {},
          isActive: true
        });
        setProvider(providerData);
      }

      setUser(newUser);
      pregacareDB.users.setCurrentUser(newUser);

      return { user: newUser };
    } catch (error) {
      return { error: 'Failed to create account' };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ user?: User; error?: string }> => {
    try {
      setLoading(true);
      
      // In a real app, you'd validate the password
      const foundUser = pregacareDB.users.findByEmail(email);
      
      if (!foundUser) {
        return { error: 'User not found' };
      }

      if (!foundUser.isActive) {
        return { error: 'Account is deactivated' };
      }

      setUser(foundUser);
      pregacareDB.users.setCurrentUser(foundUser);
      await fetchUserProfile(foundUser);

      return { user: foundUser };
    } catch (error) {
      return { error: 'Failed to sign in' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    pregacareDB.users.setCurrentUser(null);
    setUser(null);
    setPatient(null);
    setProvider(null);
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ error?: string }> => {
    if (!user) return { error: 'No user logged in' };

    try {
      const updatedUser = pregacareDB.users.update(user.id, updates);
      if (!updatedUser) {
        return { error: 'Failed to update profile' };
      }

      setUser(updatedUser);
      pregacareDB.users.setCurrentUser(updatedUser);

      // Update corresponding patient/provider profile
      if (user.role === 'patient' && patient) {
        const updatedPatient = pregacareDB.patients.update(patient.id, {
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          profilePicture: updatedUser.profilePicture
        });
        if (updatedPatient) setPatient(updatedPatient);
      } else if (provider) {
        const updatedProvider = pregacareDB.providers.update(provider.id, {
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          profilePicture: updatedUser.profilePicture
        });
        if (updatedProvider) setProvider(updatedProvider);
      }

      return {};
    } catch (error) {
      return { error: 'Failed to update profile' };
    }
  };

  const value: AuthContextType = {
    user,
    patient,
    provider,
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
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}