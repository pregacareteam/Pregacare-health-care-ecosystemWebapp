import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import ProviderServiceManager from '@/lib/providerServiceManager';
import { 
  Stethoscope, 
  TestTube, 
  Utensils, 
  Brain, 
  Heart, 
  Pill, 
  Truck, 
  Users, 
  Activity,
  Settings,
  Plus,
  Copy,
  CheckCircle,
  Clock,
  User
} from 'lucide-react';

const roleConfigs = {
  doctor: { title: 'Doctor', icon: Stethoscope, color: 'blue' },
  radiologist: { title: 'Radiologist', icon: Activity, color: 'purple' },
  lab_technician: { title: 'Lab Technician', icon: TestTube, color: 'green' },
  nutritionist: { title: 'Nutritionist', icon: Utensils, color: 'orange' },
  therapist: { title: 'Therapist', icon: Brain, color: 'indigo' },
  yoga_instructor: { title: 'Yoga Instructor', icon: Heart, color: 'pink' },
  pharmacy: { title: 'Pharmacy', icon: Pill, color: 'red' },
  food_service: { title: 'Food Service', icon: Truck, color: 'yellow' },
  community_manager: { title: 'Community Manager', icon: Users, color: 'cyan' },
  admin: { title: 'Admin', icon: Settings, color: 'gray' }
};

export default function ProviderIdDemo() {
  const [demoProviders, setDemoProviders] = useState<any[]>([]);
  const [nextUserId, setNextUserId] = useState(1);
  const { toast } = useToast();

  const createDemoUser = (name: string, roles: string[]) => {
    const userId = `user_${nextUserId}`;
    const newProviders: any[] = [];

    roles.forEach(role => {
      const providerId = ProviderServiceManager.generateProviderId(role);
      const config = roleConfigs[role as keyof typeof roleConfigs];
      
      newProviders.push({
        id: providerId,
        userId,
        userName: name,
        roleType: role,
        displayName: `${config?.title === 'Doctor' ? 'Dr.' : ''} ${name}`.trim(),
        serviceTitle: `${name} - ${config?.title} Specialist`,
        status: 'verified',
        consultationFee: role === 'doctor' ? 150 : role === 'nutritionist' ? 75 : 100,
        icon: config?.icon,
        color: config?.color,
        createdAt: new Date().toISOString()
      });
    });

    setDemoProviders(prev => [...prev, ...newProviders]);
    setNextUserId(prev => prev + 1);

    // Show success message with generated IDs
    const generatedIds = newProviders.map(p => p.id).join(', ');
    toast({
      title: "Provider IDs Generated",
      description: `Created: ${generatedIds}`,
      duration: 4000,
    });
  };

  const copyProviderId = (providerId: string) => {
    navigator.clipboard.writeText(providerId);
    toast({
      title: "Provider ID Copied",
      description: `${providerId} copied to clipboard`,
    });
  };

  const clearDemo = () => {
    setDemoProviders([]);
    setNextUserId(1);
    toast({
      title: "Demo Reset",
      description: "All demo data cleared",
    });
  };

  // Group providers by user
  const providersByUser = demoProviders.reduce((acc, provider) => {
    if (!acc[provider.userId]) {
      acc[provider.userId] = {
        userId: provider.userId,
        userName: provider.userName,
        providers: []
      };
    }
    acc[provider.userId].providers.push(provider);
    return acc;
  }, {} as any);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Provider Service ID Generator Demo</h2>
        <p className="text-gray-600">See how unique service IDs are automatically generated for each professional role</p>
      </div>

      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Demo Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              onClick={() => createDemoUser('Sarah Johnson', ['doctor'])}
              className="p-4 h-auto flex-col bg-blue-600 hover:bg-blue-700"
            >
              <Stethoscope className="w-6 h-6 mb-2" />
              <span>Dr. Sarah Johnson</span>
              <span className="text-xs opacity-80">Doctor Only</span>
            </Button>
            
            <Button 
              onClick={() => createDemoUser('Michael Chen', ['doctor', 'nutritionist'])}
              className="p-4 h-auto flex-col bg-purple-600 hover:bg-purple-700"
            >
              <Users className="w-6 h-6 mb-2" />
              <span>Dr. Michael Chen</span>
              <span className="text-xs opacity-80">Doctor + Nutritionist</span>
            </Button>
            
            <Button 
              onClick={() => createDemoUser('Emma Wilson', ['nutritionist', 'yoga_instructor', 'therapist'])}
              className="p-4 h-auto flex-col bg-green-600 hover:bg-green-700"
            >
              <Heart className="w-6 h-6 mb-2" />
              <span>Emma Wilson</span>
              <span className="text-xs opacity-80">Multi-Role Wellness</span>
            </Button>
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button variant="outline" onClick={clearDemo}>
              Clear Demo Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Provider IDs */}
      {Object.keys(providersByUser).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Provider Service IDs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.values(providersByUser).map((userGroup: any) => (
                <div key={userGroup.userId} className="border rounded-lg p-4 bg-gray-50">
                  {/* User Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white rounded-full">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{userGroup.userName}</h3>
                      <p className="text-sm text-gray-600">User ID: {userGroup.userId}</p>
                    </div>
                    <Badge variant="secondary">
                      {userGroup.providers.length} Service{userGroup.providers.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  {/* Provider Services */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {userGroup.providers.map((provider: any) => {
                      const IconComponent = provider.icon;
                      
                      return (
                        <Card key={provider.id} className="bg-white border-2">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className={`p-2 rounded-lg bg-${provider.color}-100`}>
                                <IconComponent className={`w-5 h-5 text-${provider.color}-600`} />
                              </div>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </div>
                            
                            <h4 className="font-semibold text-sm mb-1">{provider.displayName}</h4>
                            <p className="text-xs text-gray-600 mb-3">{provider.serviceTitle}</p>
                            
                            {/* Provider ID Display */}
                            <div className="bg-gray-100 p-2 rounded flex items-center justify-between">
                              <span className="font-mono text-sm font-bold text-gray-900">
                                {provider.id}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyProviderId(provider.id)}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            <div className="mt-2 flex justify-between items-center text-xs">
                              <span className="text-gray-500">Fee</span>
                              <span className="font-semibold">${provider.consultationFee}</span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Explanation */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                How Provider Service ID Generation Works
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-800 flex-shrink-0 mt-0.5">1</span>
                  <span><strong>User Signs Up:</strong> Person creates account with name and selects professional role</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-800 flex-shrink-0 mt-0.5">2</span>
                  <span><strong>ID Generated:</strong> System automatically creates unique provider ID (doctor_001, nutritionist_001, etc.)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-800 flex-shrink-0 mt-0.5">3</span>
                  <span><strong>Service Profile:</strong> Each role gets separate professional profile with its own ID, fees, and specialization</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-800 flex-shrink-0 mt-0.5">4</span>
                  <span><strong>Patient Booking:</strong> Patients use specific provider ID to book services (doctor_001 for medical, nutritionist_001 for diet)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}