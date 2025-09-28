import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@/types/pregacare";
import { DashboardNavigation } from "./DashboardNavigation";
import { DashboardStats } from "./DashboardStats";
import { AppointmentSection } from "./AppointmentSection";
import { CommunicationSection } from "./CommunicationSection";
import { HealthTrackingSection } from "./HealthTrackingSection";
import { pregacareDB } from "@/lib/storage";
import { 
  Heart, 
  Activity, 
  Calendar, 
  Users, 
  MessageSquare,
  Settings,
  FileText,
  Apple,
  Brain,
  Truck
} from "lucide-react";

interface UniversalDashboardProps {
  user: User;
  onLogout: () => void;
}

export const UniversalDashboard = ({ user, onLogout }: UniversalDashboardProps) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, [user]);

  const loadUserStats = async () => {
    setLoading(true);
    try {
      const appointments = pregacareDB.appointments.getAll();
      const patients = pregacareDB.patients.getAll();
      const providers = pregacareDB.providers.getAll();
      const communications = pregacareDB.communications.getAll();

      let userStats = {};

      switch (user.role) {
        case 'doctor':
          const doctorAppointments = appointments.filter(apt => apt.providerId === user.id);
          const doctorPatients = patients.filter(p => p.assignedProviders.doctorId === user.id);
          userStats = {
            total: doctorPatients.length,
            active: doctorPatients.length, // All assigned patients are considered active
            thisWeek: doctorAppointments.filter(apt => 
              new Date(apt.appointmentDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length,
            emergency: doctorPatients.filter(p => p.riskStatus === 'high').length,
            completed: appointments.filter(apt => 
              apt.providerId === user.id && apt.status === 'completed'
            ).length,
            pending: doctorAppointments.filter(apt => apt.status === 'scheduled').length
          };
          break;

        case 'patient':
          const patientAppointments = appointments.filter(apt => apt.patientId === user.id);
          const patientData = patients.find(p => p.userId === user.id);
          userStats = {
            pregnancyWeek: patientData?.pregnancyStage === 'first_trimester' ? 12 : 
                          patientData?.pregnancyStage === 'second_trimester' ? 24 : 32,
            thisWeek: patientAppointments.filter(apt => 
              new Date(apt.appointmentDate) >= new Date() && 
              new Date(apt.appointmentDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            ).length,
            healthScore: 85,
            medications: pregacareDB.prescriptions.getFiltered(p => p.patientId === user.id).length
          };
          break;

        case 'nutritionist':
          const nutritionistPatients = patients.filter(p => p.assignedProviders.nutritionistId === user.id);
          const nutritionistAppointments = appointments.filter(apt => apt.providerId === user.id);
          userStats = {
            total: nutritionistPatients.length,
            active: nutritionistPatients.length,
            thisWeek: pregacareDB.foodOrders.getFiltered(order => order.patientId === user.id).length,
            completed: pregacareDB.dietPlans.getFiltered(plan => plan.nutritionistId === user.id).length,
            pending: nutritionistAppointments.filter(apt => apt.status === 'scheduled').length
          };
          break;

        case 'yoga_trainer':
          const yogaStudents = patients.filter(p => p.assignedProviders.yogaTrainerId === user.id);
          const yogaSessions = pregacareDB.yogaSessions.getFiltered(session => session.trainerId === user.id);
          userStats = {
            total: yogaStudents.length,
            active: yogaStudents.length,
            thisWeek: yogaSessions.filter(session => 
              new Date(session.sessionDate) >= new Date() && 
              new Date(session.sessionDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            ).length,
            completed: yogaSessions.filter(session => session.status === 'completed').length,
            hours: yogaSessions.filter(session => session.status === 'completed').reduce((acc, session) => acc + session.duration, 0) / 60
          };
          break;

        case 'therapist':
          const therapistPatients = patients.filter(p => p.assignedProviders.therapistId === user.id);
          const therapySessions = pregacareDB.therapySessions.getFiltered(session => session.therapistId === user.id);
          userStats = {
            total: therapistPatients.length,
            active: therapistPatients.length,
            thisWeek: therapySessions.filter(session => 
              new Date(session.sessionDate) >= new Date() && 
              new Date(session.sessionDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            ).length,
            wellnessScore: 82,
            completed: therapySessions.filter(session => session.status === 'completed').length
          };
          break;

        case 'delivery_partner':
          const foodOrders = pregacareDB.foodOrders.getAll(); // All orders for now
          const todayOrders = foodOrders.filter(order => 
            new Date(order.orderDate).toDateString() === new Date().toDateString()
          );
          userStats = {
            thisWeek: todayOrders.length,
            pending: todayOrders.filter(order => order.status === 'preparing').length,
            active: foodOrders.filter(order => order.status === 'out_for_delivery').length,
            rating: 4.8,
            revenue: '12.5k'
          };
          break;
      }

      setStats(userStats);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSectionContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      );
    }

    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {user.name}!
              </h2>
              <p className="text-gray-600">
                Here's your {user.role} dashboard overview
              </p>
            </div>
            <DashboardStats role={user.role} stats={stats} />
            
            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {getQuickActions().map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => setActiveSection(action.section)}
                        className="p-4 text-center hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Icon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <span className="text-sm font-medium">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'appointments':
        return <AppointmentSection user={user} />;
      
      case 'messages':
        return <CommunicationSection user={user} />;
      
      case 'health':
        return <HealthTrackingSection user={user} />;
      
      default:
        return (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Coming Soon
            </h3>
            <p className="text-gray-500">
              This feature is being developed and will be available soon
            </p>
          </div>
        );
    }
  };

  const getQuickActions = () => {
    const baseActions = [
      { label: 'Appointments', icon: Calendar, section: 'appointments' },
      { label: 'Messages', icon: MessageSquare, section: 'messages' },
    ];

    switch (user.role) {
      case 'doctor':
        return [
          ...baseActions,
          { label: 'Patients', icon: Users, section: 'patients' },
          { label: 'Prescriptions', icon: FileText, section: 'prescriptions' }
        ];
      case 'patient':
        return [
          ...baseActions,
          { label: 'Health', icon: Heart, section: 'health' },
          { label: 'Nutrition', icon: Apple, section: 'nutrition' }
        ];
      case 'nutritionist':
        return [
          ...baseActions,
          { label: 'Diet Plans', icon: Apple, section: 'diet-plans' },
          { label: 'Patients', icon: Users, section: 'patients' }
        ];
      case 'yoga_trainer':
        return [
          ...baseActions,
          { label: 'Sessions', icon: Activity, section: 'sessions' },
          { label: 'Students', icon: Users, section: 'students' }
        ];
      case 'therapist':
        return [
          ...baseActions,
          { label: 'Therapy', icon: Brain, section: 'sessions' },
          { label: 'Patients', icon: Users, section: 'patients' }
        ];
      case 'delivery_partner':
        return [
          ...baseActions,
          { label: 'Orders', icon: Truck, section: 'orders' },
          { label: 'Menu', icon: Apple, section: 'menu' }
        ];
      default:
        return baseActions;
    }
  };

  const notificationCount = 3; // Mock notification count

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-sm">
        <DashboardNavigation
          user={user}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onLogout={onLogout}
          notificationCount={notificationCount}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {renderSectionContent()}
      </div>
    </div>
  );
};