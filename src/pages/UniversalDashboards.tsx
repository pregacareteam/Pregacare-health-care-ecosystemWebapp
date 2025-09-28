import { UniversalDashboard } from "@/components/UniversalDashboard";

interface DashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isAuthenticated: boolean;
  };
  onLogout: () => void;
}

export const PatientDashboard = ({ user, onLogout }: DashboardProps) => {
  return (
    <UniversalDashboard
      user={{
        ...user,
        role: 'patient' as const,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }}
      onLogout={onLogout}
    />
  );
};

export const DoctorDashboard = ({ user, onLogout }: DashboardProps) => {
  return (
    <UniversalDashboard
      user={{
        ...user,
        role: 'doctor' as const,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }}
      onLogout={onLogout}
    />
  );
};

export const NutritionistDashboard = ({ user, onLogout }: DashboardProps) => {
  return (
    <UniversalDashboard
      user={{
        ...user,
        role: 'nutritionist' as const,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }}
      onLogout={onLogout}
    />
  );
};

export const YogaDashboard = ({ user, onLogout }: DashboardProps) => {
  return (
    <UniversalDashboard
      user={{
        ...user,
        role: 'yoga_trainer' as const,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }}
      onLogout={onLogout}
    />
  );
};

export const TherapistDashboard = ({ user, onLogout }: DashboardProps) => {
  return (
    <UniversalDashboard
      user={{
        ...user,
        role: 'therapist' as const,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }}
      onLogout={onLogout}
    />
  );
};

export const DeliveryDashboard = ({ user, onLogout }: DashboardProps) => {
  return (
    <UniversalDashboard
      user={{
        ...user,
        role: 'delivery_partner' as const,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }}
      onLogout={onLogout}
    />
  );
};