import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  Heart, 
  Activity, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface DashboardStatsProps {
  role: string;
  stats: {
    total?: number;
    active?: number;
    pending?: number;
    completed?: number;
    thisWeek?: number;
    thisMonth?: number;
    emergency?: number;
    [key: string]: any;
  };
}

export const DashboardStats = ({ role, stats }: DashboardStatsProps) => {
  const getStatsForRole = (role: string) => {
    switch (role) {
      case 'doctor':
        return [
          {
            title: "Total Patients",
            value: stats.total || 0,
            icon: Users,
            description: `${stats.active || 0} active cases`,
            trend: "+12% from last month",
            color: "blue"
          },
          {
            title: "Appointments Today",
            value: stats.thisWeek || 0,
            icon: Calendar,
            description: `${stats.pending || 0} pending confirmations`,
            trend: "Next: 2:30 PM",
            color: "green"
          },
          {
            title: "Critical Cases",
            value: stats.emergency || 0,
            icon: AlertCircle,
            description: "Require immediate attention",
            trend: stats.emergency ? "Action needed" : "All stable",
            color: stats.emergency ? "red" : "green"
          },
          {
            title: "Prescriptions",
            value: stats.completed || 0,
            icon: CheckCircle,
            description: "This month",
            trend: "+8% from last month",
            color: "purple"
          }
        ];
      
      case 'patient':
        return [
          {
            title: "Pregnancy Week",
            value: stats.pregnancyWeek || 0,
            icon: Heart,
            description: "Current stage",
            trend: `${40 - (stats.pregnancyWeek || 0)} weeks remaining`,
            color: "pink"
          },
          {
            title: "Appointments",
            value: stats.thisWeek || 0,
            icon: Calendar,
            description: "This week",
            trend: "Next: Tomorrow 10:00 AM",
            color: "blue"
          },
          {
            title: "Health Score",
            value: `${stats.healthScore || 85}%`,
            icon: Activity,
            description: "Overall wellness",
            trend: "+3% improvement",
            color: "green"
          },
          {
            title: "Medications",
            value: stats.medications || 0,
            icon: CheckCircle,
            description: "Active prescriptions",
            trend: "All up to date",
            color: "purple"
          }
        ];
      
      case 'nutritionist':
        return [
          {
            title: "Active Clients",
            value: stats.total || 0,
            icon: Users,
            description: `${stats.active || 0} on meal plans`,
            trend: "+5 new this week",
            color: "green"
          },
          {
            title: "Diet Plans",
            value: stats.completed || 0,
            icon: Activity,
            description: "Created this month",
            trend: "15% increase",
            color: "blue"
          },
          {
            title: "Meal Orders",
            value: stats.thisWeek || 0,
            icon: CheckCircle,
            description: "This week",
            trend: "98% satisfaction",
            color: "purple"
          },
          {
            title: "Consultations",
            value: stats.pending || 0,
            icon: Calendar,
            description: "Scheduled today",
            trend: "Next: 1:00 PM",
            color: "orange"
          }
        ];
      
      case 'yoga':
        return [
          {
            title: "Active Students",
            value: stats.total || 0,
            icon: Users,
            description: `${stats.active || 0} regular attendees`,
            trend: "+3 new members",
            color: "purple"
          },
          {
            title: "Sessions Today",
            value: stats.thisWeek || 0,
            icon: Activity,
            description: "Scheduled classes",
            trend: "Next: Prenatal Yoga 3:00 PM",
            color: "blue"
          },
          {
            title: "Programs",
            value: stats.completed || 0,
            icon: CheckCircle,
            description: "Active wellness programs",
            trend: "95% completion rate",
            color: "green"
          },
          {
            title: "Hours This Week",
            value: stats.hours || 0,
            icon: Clock,
            description: "Teaching hours",
            trend: "On target",
            color: "orange"
          }
        ];
      
      case 'therapist':
        return [
          {
            title: "Active Clients",
            value: stats.total || 0,
            icon: Users,
            description: `${stats.active || 0} in regular therapy`,
            trend: "2 new referrals",
            color: "blue"
          },
          {
            title: "Sessions Today",
            value: stats.thisWeek || 0,
            icon: Calendar,
            description: "Appointments",
            trend: "Next: 11:00 AM",
            color: "green"
          },
          {
            title: "Wellness Score",
            value: `${stats.wellnessScore || 82}%`,
            icon: Heart,
            description: "Average client progress",
            trend: "+7% this month",
            color: "pink"
          },
          {
            title: "Programs",
            value: stats.completed || 0,
            icon: CheckCircle,
            description: "Completed this month",
            trend: "Excellent outcomes",
            color: "purple"
          }
        ];
      
      case 'food_partner':
        return [
          {
            title: "Orders Today",
            value: stats.thisWeek || 0,
            icon: CheckCircle,
            description: `${stats.pending || 0} in preparation`,
            trend: "+15% from yesterday",
            color: "green"
          },
          {
            title: "Active Deliveries",
            value: stats.active || 0,
            icon: Activity,
            description: "In transit",
            trend: "Avg: 28 min delivery",
            color: "blue"
          },
          {
            title: "Customer Rating",
            value: `${stats.rating || 4.8}★`,
            icon: Heart,
            description: "This month",
            trend: "+0.2 improvement",
            color: "yellow"
          },
          {
            title: "Revenue",
            value: `₹${stats.revenue || '12.5k'}`,
            icon: TrendingUp,
            description: "This week",
            trend: "+22% growth",
            color: "purple"
          }
        ];
      
      default:
        return [];
    }
  };

  const roleStats = getStatsForRole(role);

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "border-blue-200 bg-blue-50",
      green: "border-green-200 bg-green-50", 
      red: "border-red-200 bg-red-50",
      purple: "border-purple-200 bg-purple-50",
      pink: "border-pink-200 bg-pink-50",
      orange: "border-orange-200 bg-orange-50",
      yellow: "border-yellow-200 bg-yellow-50"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getIconColorClasses = (color: string) => {
    const colors = {
      blue: "text-blue-600",
      green: "text-green-600",
      red: "text-red-600", 
      purple: "text-purple-600",
      pink: "text-pink-600",
      orange: "text-orange-600",
      yellow: "text-yellow-600"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {roleStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className={`${getColorClasses(stat.color)} border-2`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-5 w-5 ${getIconColorClasses(stat.color)}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  {stat.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};