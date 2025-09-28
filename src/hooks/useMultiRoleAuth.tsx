import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Patient, Provider, UserRole, UserSession } from '@/types/multiRoleUser';
import { pregacareDB } from '@/lib/storage';

interface MultiRoleAuthContextType {
  user: User | null;
  currentRole: UserRole['role'] | null;
  userRoles: UserRole[];
  patient: Patient | null;
  provider: Provider | null;
  session: UserSession | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: { name: string; role: UserRole['role']; phone?: string }) => Promise<{ user?: User; error?: string }>;
  signIn: (email: string, password: string, preferredRole?: UserRole['role']) => Promise<{ user?: User; error?: string }>;
  signOut: () => Promise<void>;
  switchRole: (newRole: UserRole['role']) => Promise<{ error?: string }>;
  addRole: (newRole: UserRole['role'], approvalData?: any) => Promise<{ error?: string }>;
  updateProfile: (updates: Partial<User>) => Promise<{ error?: string }>;
  hasRole: (role: UserRole['role']) => boolean;
  canAccessRole: (role: UserRole['role']) => boolean;
}

const MultiRoleAuthContext = createContext<MultiRoleAuthContextType | undefined>(undefined);

export function MultiRoleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole['role'] | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const existingSession = localStorage.getItem('pregacare_session');
    if (existingSession) {
      const sessionData = JSON.parse(existingSession);
      restoreSession(sessionData);
    }
    setLoading(false);
  }, []);

  const restoreSession = async (sessionData: UserSession) => {
    try {
      const foundUser = pregacareDB.users.findById(sessionData.userId);
      if (foundUser && foundUser.isActive) {
        setUser(foundUser);
        setCurrentRole(sessionData.currentRole);
        setUserRoles(foundUser.roles);
        setSession(sessionData);
        await fetchUserProfiles(foundUser, sessionData.currentRole);
      } else {
        // Clear invalid session
        localStorage.removeItem('pregacare_session');
      }
    } catch (error) {
      console.error('Error restoring session:', error);
      localStorage.removeItem('pregacare_session');
    }
  };

  const fetchUserProfiles = async (currentUser: User, activeRole: UserRole['role']) => {
    try {
      // Always fetch patient profile if user has patient role
      if (currentUser.roles.some(r => r.role === 'patient' && r.isActive)) {
        const patientProfile = pregacareDB.patients.findByUserId(currentUser.id);
        setPatient(patientProfile);
      }

      // Fetch provider profile if current role is a provider role
      const providerRoles = ['doctor', 'radiologist', 'lab_technician', 'nutritionist', 'therapist', 'yoga_instructor', 'pharmacy', 'food_service', 'community_manager'];
      if (providerRoles.includes(activeRole)) {
        const providerProfile = pregacareDB.providers.findByUserId(currentUser.id);
        setProvider(providerProfile);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const createSession = (userId: string, role: UserRole['role']): UserSession => {
    const sessionData: UserSession = {
      userId,
      currentRole: role,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      ipAddress: 'localhost', // In real app, get actual IP
      userAgent: navigator.userAgent
    };
    
    localStorage.setItem('pregacare_session', JSON.stringify(sessionData));
    setSession(sessionData);
    return sessionData;
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: { name: string; role: UserRole['role']; phone?: string }
  ): Promise<{ user?: User; error?: string }> => {
    try {
      setLoading(true);
      
      // Check if user already exists
      let existingUser = pregacareDB.users.findByEmail(email);
      
      if (existingUser) {
        // User exists - check if they want to add a new role
        const hasRole = existingUser.roles.some(r => r.role === userData.role);
        
        if (hasRole) {
          return { error: `You already have a ${userData.role} account with this email. Please sign in instead.` };
        } else {
          // Add new role to existing user
          const newRole: UserRole = {
            role: userData.role,
            isActive: userData.role === 'patient', // Patients auto-approved, providers need approval
            addedAt: new Date().toISOString(),
            approvalStatus: userData.role === 'patient' ? 'approved' : 'pending'
          };
          
          existingUser.roles.push(newRole);
          existingUser.updatedAt = new Date().toISOString();
          
          const updatedUser = pregacareDB.users.update(existingUser.id, existingUser);
          if (!updatedUser) {
            return { error: 'Failed to add new role' };
          }
          
          setUser(updatedUser);
          setUserRoles(updatedUser.roles);
          setCurrentRole(userData.role);
          
          // Create profiles for new role
          await createRoleProfile(updatedUser, userData.role);
          
          createSession(updatedUser.id, userData.role);
          
          return { 
            user: updatedUser,
            error: userData.role === 'patient' ? undefined : 'Provider account created. Awaiting approval from administrators.'
          };
        }
      } else {
        // Create new user
        const initialRole: UserRole = {
          role: userData.role,
          isActive: true,
          addedAt: new Date().toISOString(),
          approvalStatus: userData.role === 'patient' ? 'approved' : 'pending'
        };

        const newUser = pregacareDB.users.create({
          email,
          name: userData.name,
          phone: userData.phone,
          roles: [initialRole],
          primaryRole: userData.role,
          isActive: true,
          emailVerified: false
        });

        setUser(newUser);
        setUserRoles(newUser.roles);
        setCurrentRole(userData.role);
        
        // Create corresponding profile
        await createRoleProfile(newUser, userData.role);
        
        createSession(newUser.id, userData.role);

        return { 
          user: newUser,
          error: userData.role === 'patient' ? undefined : 'Provider account created. Awaiting approval from administrators.'
        };
      }
    } catch (error) {
      return { error: 'Failed to create account' };
    } finally {
      setLoading(false);
    }
  };

  const createRoleProfile = async (user: User, role: UserRole['role']) => {
    if (role === 'patient') {
      const patientData = pregacareDB.patients.create({
        userId: user.id,
        pregnancyStage: 'first_trimester',
        riskStatus: 'normal',
        medicalHistory: {
          conditions: [],
          allergies: [],
          medications: [],
          surgeries: []
        },
        assignedProviders: {},
        isActive: true
      });
      setPatient(patientData);
    } else {
      // Provider roles
      const providerData = pregacareDB.providers.create({
        userId: user.id,
        providerType: role as any,
        availability: {},
        verificationStatus: 'pending',
        isActive: false // Inactive until approved
      });
      setProvider(providerData);
    }
  };

  const signIn = async (
    email: string, 
    password: string, 
    preferredRole?: UserRole['role']
  ): Promise<{ user?: User; error?: string }> => {
    try {
      setLoading(true);
      
      const foundUser = pregacareDB.users.findByEmail(email);
      
      if (!foundUser) {
        return { error: 'User not found' };
      }

      if (!foundUser.isActive) {
        return { error: 'Account is deactivated' };
      }

      // Determine which role to use
      let roleToUse: UserRole['role'];
      
      if (preferredRole && foundUser.roles.some(r => r.role === preferredRole && r.isActive)) {
        roleToUse = preferredRole;
      } else {
        // Use primary role or first active role
        const activeRoles = foundUser.roles.filter(r => r.isActive && r.approvalStatus === 'approved');
        if (activeRoles.length === 0) {
          return { error: 'No active roles found. Please contact support.' };
        }
        
        roleToUse = foundUser.primaryRole && activeRoles.some(r => r.role === foundUser.primaryRole) 
          ? foundUser.primaryRole 
          : activeRoles[0].role;
      }

      setUser(foundUser);
      setCurrentRole(roleToUse);
      setUserRoles(foundUser.roles);
      
      await fetchUserProfiles(foundUser, roleToUse);
      createSession(foundUser.id, roleToUse);

      return { user: foundUser };
    } catch (error) {
      return { error: 'Failed to sign in' };
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async (newRole: UserRole['role']): Promise<{ error?: string }> => {
    if (!user) return { error: 'No user logged in' };

    const roleExists = user.roles.find(r => r.role === newRole && r.isActive && r.approvalStatus === 'approved');
    if (!roleExists) {
      return { error: 'You do not have access to this role' };
    }

    try {
      setCurrentRole(newRole);
      await fetchUserProfiles(user, newRole);
      
      // Update session
      if (session) {
        const updatedSession = {
          ...session,
          currentRole: newRole,
          lastActivity: new Date().toISOString()
        };
        localStorage.setItem('pregacare_session', JSON.stringify(updatedSession));
        setSession(updatedSession);
      }

      return {};
    } catch (error) {
      return { error: 'Failed to switch role' };
    }
  };

  const addRole = async (newRole: UserRole['role'], approvalData?: any): Promise<{ error?: string }> => {
    if (!user) return { error: 'No user logged in' };

    const hasRole = user.roles.some(r => r.role === newRole);
    if (hasRole) {
      return { error: 'You already have this role' };
    }

    try {
      const roleToAdd: UserRole = {
        role: newRole,
        isActive: newRole === 'patient', // Patients auto-active, providers need approval
        addedAt: new Date().toISOString(),
        approvalStatus: newRole === 'patient' ? 'approved' : 'pending',
        ...approvalData
      };

      const updatedRoles = [...user.roles, roleToAdd];
      const updatedUser = pregacareDB.users.update(user.id, { 
        roles: updatedRoles,
        updatedAt: new Date().toISOString()
      });

      if (!updatedUser) {
        return { error: 'Failed to add role' };
      }

      setUser(updatedUser);
      setUserRoles(updatedUser.roles);
      
      // Create profile for new role
      await createRoleProfile(updatedUser, newRole);

      return newRole === 'patient' ? {} : { error: 'Role request submitted. Awaiting approval.' };
    } catch (error) {
      return { error: 'Failed to add role' };
    }
  };

  const signOut = async () => {
    setLoading(true);
    localStorage.removeItem('pregacare_session');
    setUser(null);
    setCurrentRole(null);
    setUserRoles([]);
    setPatient(null);
    setProvider(null);
    setSession(null);
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ error?: string }> => {
    if (!user) return { error: 'No user logged in' };

    try {
      const updatedUser = pregacareDB.users.update(user.id, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      if (!updatedUser) {
        return { error: 'Failed to update profile' };
      }

      setUser(updatedUser);

      // Update corresponding profiles
      if (patient) {
        const updatedPatient = pregacareDB.patients.update(patient.id, {
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          profilePicture: updatedUser.profilePicture,
          updatedAt: new Date().toISOString()
        });
        if (updatedPatient) setPatient(updatedPatient);
      }

      if (provider) {
        const updatedProvider = pregacareDB.providers.update(provider.id, {
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          profilePicture: updatedUser.profilePicture,
          updatedAt: new Date().toISOString()
        });
        if (updatedProvider) setProvider(updatedProvider);
      }

      return {};
    } catch (error) {
      return { error: 'Failed to update profile' };
    }
  };

  const hasRole = (role: UserRole['role']): boolean => {
    return userRoles.some(r => r.role === role);
  };

  const canAccessRole = (role: UserRole['role']): boolean => {
    return userRoles.some(r => r.role === role && r.isActive && r.approvalStatus === 'approved');
  };

  const value: MultiRoleAuthContextType = {
    user,
    currentRole,
    userRoles,
    patient,
    provider,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    switchRole,
    addRole,
    updateProfile,
    hasRole,
    canAccessRole
  };

  return (
    <MultiRoleAuthContext.Provider value={value}>
      {children}
    </MultiRoleAuthContext.Provider>
  );
}

export function useMultiRoleAuth() {
  const context = useContext(MultiRoleAuthContext);
  if (context === undefined) {
    throw new Error('useMultiRoleAuth must be used within a MultiRoleAuthProvider');
  }
  return context;
}