import { useState, useEffect } from 'react';
import ProviderServiceManager from '@/lib/providerServiceManager';

// Enhanced User Management for Multi-Role Support
export interface MultiRoleUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profilePicture?: string;
  roles: UserRoleInfo[];
  currentRole: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRoleInfo {
  role: string;
  status: 'active' | 'pending' | 'rejected';
  addedAt: string;
  approvedBy?: string;
  specialization?: string;
  licenseNumber?: string;
  notes?: string;
}

// Multi-Role Management Functions
export class MultiRoleManager {
  private static STORAGE_KEY = 'pregacare_multi_users';
  
  static getUsers(): MultiRoleUser[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }
  
  static saveUsers(users: MultiRoleUser[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  }
  
  static findUserByEmail(email: string): MultiRoleUser | null {
    const users = this.getUsers();
    return users.find(user => user.email === email) || null;
  }
  
  static createOrUpdateUser(
    email: string, 
    userData: { name: string; role: string; phone?: string }
  ): { user: MultiRoleUser; isNewUser: boolean; needsApproval: boolean } {
    const users = this.getUsers();
    let existingUser = users.find(user => user.email === email);
    
    const providerRoles = ['doctor', 'radiologist', 'lab_technician', 'nutritionist', 'therapist', 'yoga_instructor', 'pharmacy', 'food_service', 'community_manager'];
    const needsApproval = providerRoles.includes(userData.role);
    
    if (existingUser) {
      // User exists - add new role
      const hasRole = existingUser.roles.some(r => r.role === userData.role);
      
      if (hasRole) {
        throw new Error(`You already have a ${userData.role} account with this email`);
      }
      
      // Add new role
      const newRole: UserRoleInfo = {
        role: userData.role,
        status: needsApproval ? 'pending' : 'active',
        addedAt: new Date().toISOString(),
        specialization: '',
        notes: 'Role added via registration'
      };
      
      existingUser.roles.push(newRole);
      existingUser.currentRole = userData.role;
      existingUser.updatedAt = new Date().toISOString();
      
      this.saveUsers(users);
      
      return { 
        user: existingUser, 
        isNewUser: false, 
        needsApproval 
      };
    } else {
      // Create new user
      const newUser: MultiRoleUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        name: userData.name,
        phone: userData.phone,
        roles: [{
          role: userData.role,
          status: needsApproval ? 'pending' : 'active',
          addedAt: new Date().toISOString(),
          specialization: '',
          notes: 'Initial role'
        }],
        currentRole: userData.role,
        isActive: true,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      users.push(newUser);
      this.saveUsers(users);
      
      return { 
        user: newUser, 
        isNewUser: true, 
        needsApproval 
      };
    }
  }
  
  static switchUserRole(email: string, newRole: string): { success: boolean; error?: string } {
    const users = this.getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    const roleInfo = user.roles.find(r => r.role === newRole);
    if (!roleInfo) {
      return { success: false, error: 'Role not found' };
    }
    
    if (roleInfo.status !== 'active') {
      return { success: false, error: 'Role is not active' };
    }
    
    user.currentRole = newRole;
    user.updatedAt = new Date().toISOString();
    
    this.saveUsers(users);
    return { success: true };
  }
  
  static addUserRole(
    email: string, 
    roleData: { role: string; specialization?: string; licenseNumber?: string; reason: string }
  ): { success: boolean; error?: string; needsApproval?: boolean } {
    const users = this.getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    const hasRole = user.roles.some(r => r.role === roleData.role);
    if (hasRole) {
      return { success: false, error: 'You already have this role' };
    }
    
    const providerRoles = ['doctor', 'radiologist', 'lab_technician', 'nutritionist', 'therapist', 'yoga_instructor', 'pharmacy', 'food_service', 'community_manager'];
    const needsApproval = providerRoles.includes(roleData.role);
    
    const newRole: UserRoleInfo = {
      role: roleData.role,
      status: needsApproval ? 'pending' : 'active',
      addedAt: new Date().toISOString(),
      specialization: roleData.specialization,
      licenseNumber: roleData.licenseNumber,
      notes: roleData.reason
    };
    
    user.roles.push(newRole);
    user.updatedAt = new Date().toISOString();
    
    this.saveUsers(users);
    
    return { success: true, needsApproval };
  }
  
  static getUserActiveRoles(email: string): string[] {
    const user = this.findUserByEmail(email);
    if (!user) return [];
    
    return user.roles
      .filter(role => role.status === 'active')
      .map(role => role.role);
  }
  
  static canAccessRole(email: string, role: string): boolean {
    const activeRoles = this.getUserActiveRoles(email);
    return activeRoles.includes(role);
  }
}

// Enhanced Auth Hook for Multi-Role Support
export function useEnhancedAuth() {
  const [currentUser, setCurrentUser] = useState<MultiRoleUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check for existing session
    const session = localStorage.getItem('pregacare_session');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        const user = MultiRoleManager.findUserByEmail(sessionData.email);
        if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        localStorage.removeItem('pregacare_session');
      }
    }
    setLoading(false);
  }, []);
  
  const signUp = async (
    email: string, 
    password: string, 
    userData: { name: string; role: string; phone?: string }
  ) => {
    try {
      const result = MultiRoleManager.createOrUpdateUser(email, userData);
      
      // Create session
      localStorage.setItem('pregacare_session', JSON.stringify({
        email,
        currentRole: userData.role,
        loginTime: new Date().toISOString()
      }));
      
      setCurrentUser(result.user);
      
      // Create provider service profile if it's a provider role
      let generatedProviderId = null;
      if (userData.role !== 'patient') {
        const providerService = ProviderServiceManager.createProviderService(result.user.id, userData.role, {
          displayName: result.user.name,
          specialization: `${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} Specialist`
        });
        generatedProviderId = providerService.id;
      }
      
      if (result.needsApproval) {
        return { 
          user: result.user,
          providerId: generatedProviderId,
          message: result.isNewUser 
            ? `Account created! Your provider ID is ${generatedProviderId}. Role is pending approval.` 
            : `New role added! Your provider ID is ${generatedProviderId}. Provider access is pending approval.`
        };
      }
      
      return { 
        user: result.user,
        providerId: generatedProviderId,
        message: result.isNewUser 
          ? (generatedProviderId ? `Account created! Your provider ID: ${generatedProviderId}` : 'Account created successfully!')
          : (generatedProviderId ? `New role added! Your provider ID: ${generatedProviderId}` : 'New role added successfully!')
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create account' };
    }
  };
  
  const signIn = async (email: string, password: string, preferredRole?: string) => {
    try {
      const user = MultiRoleManager.findUserByEmail(email);
      
      if (!user) {
        return { error: 'User not found' };
      }
      
      if (!user.isActive) {
        return { error: 'Account is deactivated' };
      }
      
      // Determine role to use
      let roleToUse = preferredRole;
      
      if (preferredRole && MultiRoleManager.canAccessRole(email, preferredRole)) {
        roleToUse = preferredRole;
      } else {
        // Use current role or first active role
        const activeRoles = MultiRoleManager.getUserActiveRoles(email);
        if (activeRoles.length === 0) {
          return { error: 'No active roles found. Please contact support.' };
        }
        roleToUse = activeRoles.includes(user.currentRole) ? user.currentRole : activeRoles[0];
      }
      
      // Switch to the role
      const switchResult = MultiRoleManager.switchUserRole(email, roleToUse!);
      if (!switchResult.success) {
        return { error: switchResult.error };
      }
      
      // Create session
      localStorage.setItem('pregacare_session', JSON.stringify({
        email,
        currentRole: roleToUse,
        loginTime: new Date().toISOString()
      }));
      
      const updatedUser = MultiRoleManager.findUserByEmail(email);
      setCurrentUser(updatedUser);
      
      return { user: updatedUser };
    } catch (error) {
      return { error: 'Failed to sign in' };
    }
  };
  
  const switchRole = async (newRole: string) => {
    if (!currentUser) {
      return { error: 'No user logged in' };
    }
    
    const result = MultiRoleManager.switchUserRole(currentUser.email, newRole);
    if (!result.success) {
      return { error: result.error };
    }
    
    // Update session
    const session = JSON.parse(localStorage.getItem('pregacare_session') || '{}');
    session.currentRole = newRole;
    localStorage.setItem('pregacare_session', JSON.stringify(session));
    
    const updatedUser = MultiRoleManager.findUserByEmail(currentUser.email);
    setCurrentUser(updatedUser);
    
    return { success: true };
  };
  
  const addRole = async (roleData: { role: string; specialization?: string; licenseNumber?: string; reason: string }) => {
    if (!currentUser) {
      return { error: 'No user logged in' };
    }
    
    const result = MultiRoleManager.addUserRole(currentUser.email, roleData);
    if (!result.success) {
      return { error: result.error };
    }
    
    const updatedUser = MultiRoleManager.findUserByEmail(currentUser.email);
    setCurrentUser(updatedUser);
    
    // Generate provider service ID for the new role
    let generatedProviderId = null;
    if (roleData.role !== 'patient') {
      const providerService = ProviderServiceManager.createProviderService(currentUser.id, roleData.role, {
        displayName: currentUser.name,
        specialization: roleData.specialization || `${roleData.role.charAt(0).toUpperCase() + roleData.role.slice(1)} Specialist`
      });
      generatedProviderId = providerService.id;
    }
    
    return { 
      success: true,
      providerId: generatedProviderId,
      message: result.needsApproval 
        ? `Role request submitted for approval. Your provider ID: ${generatedProviderId}` 
        : `Role added successfully! Your provider ID: ${generatedProviderId}`
    };
  };
  
  const signOut = () => {
    localStorage.removeItem('pregacare_session');
    setCurrentUser(null);
  };
  
  const hasRole = (role: string): boolean => {
    return currentUser?.roles.some(r => r.role === role) || false;
  };
  
  const canAccessRole = (role: string): boolean => {
    return MultiRoleManager.canAccessRole(currentUser?.email || '', role);
  };
  
  return {
    currentUser,
    loading,
    signUp,
    signIn,
    signOut,
    switchRole,
    addRole,
    hasRole,
    canAccessRole
  };
}