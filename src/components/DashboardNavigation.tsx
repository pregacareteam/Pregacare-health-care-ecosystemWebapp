import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Heart, 
  Apple, 
  Activity, 
  Brain,
  Truck,
  Settings,
  LogOut,
  Bell,
  Search
} from "lucide-react";
import { User } from "@/types/pregacare";

interface DashboardNavigationProps {
  user: User;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  notificationCount?: number;
}

export const DashboardNavigation = ({ 
  user, 
  activeSection, 
  onSectionChange, 
  onLogout,
  notificationCount = 0
}: DashboardNavigationProps) => {
  
  const getMenuItemsForRole = (role: string) => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Activity },
      { id: 'messages', label: 'Messages', icon: MessageSquare },
      { id: 'appointments', label: 'Appointments', icon: Calendar },
    ];

    switch (role) {
      case 'doctor':
        return [
          ...baseItems,
          { id: 'patients', label: 'My Patients', icon: Users },
          { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
          { id: 'medical-records', label: 'Medical Records', icon: Heart },
        ];
      
      case 'patient':
        return [
          ...baseItems,
          { id: 'health', label: 'Health Tracking', icon: Heart },
          { id: 'prescriptions', label: 'My Prescriptions', icon: FileText },
          { id: 'nutrition', label: 'Nutrition Plan', icon: Apple },
          { id: 'wellness', label: 'Wellness Programs', icon: Activity },
        ];
      
      case 'nutritionist':
        return [
          ...baseItems,
          { id: 'patients', label: 'My Patients', icon: Users },
          { id: 'diet-plans', label: 'Diet Plans', icon: Apple },
          { id: 'meal-orders', label: 'Meal Orders', icon: Truck },
        ];
      
      case 'yoga':
        return [
          ...baseItems,
          { id: 'students', label: 'My Students', icon: Users },
          { id: 'sessions', label: 'Yoga Sessions', icon: Activity },
          { id: 'programs', label: 'Wellness Programs', icon: Heart },
        ];
      
      case 'therapist':
        return [
          ...baseItems,
          { id: 'patients', label: 'My Patients', icon: Users },
          { id: 'sessions', label: 'Therapy Sessions', icon: Brain },
          { id: 'assessments', label: 'Mental Health', icon: Heart },
        ];
      
      case 'food_partner':
        return [
          ...baseItems,
          { id: 'orders', label: 'Food Orders', icon: Truck },
          { id: 'menu', label: 'Menu Management', icon: Apple },
          { id: 'delivery', label: 'Delivery Tracking', icon: Activity },
        ];
      
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItemsForRole(user.role);

  return (
    <Card className="h-full">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">{user.name}</h2>
              <Badge variant="secondary" className="mt-1">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                {notificationCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${isActive ? 'bg-primary text-primary-foreground' : ''}`}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t mt-auto">
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => onSectionChange('settings')}
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};