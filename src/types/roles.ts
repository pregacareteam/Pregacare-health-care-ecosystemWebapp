export type UserRole = 'doctor' | 'nutritionist' | 'yoga' | 'therapist' | 'food_partner' | 'patient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isAuthenticated: boolean;
}

export interface RoleConfig {
  title: string;
  description: string;
  features: string[];
}