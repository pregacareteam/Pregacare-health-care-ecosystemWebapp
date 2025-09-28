import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ProviderServiceManager, { ProviderServiceProfile } from '@/lib/providerServiceManager';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
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
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  Star
} from 'lucide-react';

const roleIcons = {
  doctor: Stethoscope,
  radiologist: Activity,
  lab_technician: TestTube,
  nutritionist: Utensils,
  therapist: Brain,
  yoga_instructor: Heart,
  pharmacy: Pill,
  food_service: Truck,
  community_manager: Users,
  admin: Settings
};

const roleColors = {
  doctor: 'blue',
  radiologist: 'purple', 
  lab_technician: 'green',
  nutritionist: 'orange',
  therapist: 'indigo',
  yoga_instructor: 'pink',
  pharmacy: 'red',
  food_service: 'yellow',
  community_manager: 'cyan',
  admin: 'gray'
};

export default function ProviderServiceDashboard() {
  const { currentUser } = useEnhancedAuth();
  const [providerServices, setProviderServices] = useState<ProviderServiceProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      loadProviderServices();
    }
  }, [currentUser]);

  const loadProviderServices = () => {
    if (!currentUser) return;
    
    const services = ProviderServiceManager.getUserProviderProfiles(currentUser.id);
    setProviderServices(services);
    setLoading(false);
  };

  const copyProviderId = (providerId: string) => {
    navigator.clipboard.writeText(providerId);
    toast({
      title: "Provider ID Copied",
      description: `${providerId} copied to clipboard`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'suspended': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please sign in to view provider services</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading provider services...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Provider Service IDs</h2>
          <p className="text-gray-600">Unique service identifiers for each professional role</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {providerServices.length} Service{providerServices.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Provider Services Grid */}
      {providerServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providerServices.map((service) => {
            const IconComponent = roleIcons[service.roleType as keyof typeof roleIcons] || Settings;
            const color = roleColors[service.roleType as keyof typeof roleColors] || 'gray';
            
            return (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg bg-${color}-100`}>
                      <IconComponent className={`w-6 h-6 text-${color}-600`} />
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(service.verificationStatus)}
                      {service.isActive && <Badge className="text-xs bg-green-500">Active</Badge>}
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{service.displayName}</CardTitle>
                    <p className="text-sm text-gray-600">{service.serviceTitle}</p>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Provider ID */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Provider ID</p>
                        <p className="text-sm font-mono font-bold text-gray-900">{service.id}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyProviderId(service.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className={`text-xs ${getStatusColor(service.verificationStatus)}`}>
                      {service.verificationStatus.charAt(0).toUpperCase() + service.verificationStatus.slice(1)}
                    </Badge>
                  </div>

                  {/* Specialization */}
                  {service.specialization && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Specialization</span>
                      <span className="text-sm font-medium">{service.specialization}</span>
                    </div>
                  )}

                  {/* License */}
                  {service.licenseNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">License</span>
                      <span className="text-sm font-mono">{service.licenseNumber}</span>
                    </div>
                  )}

                  {/* Consultation Fee */}
                  {service.consultationFee && service.consultationFee > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Consultation Fee</span>
                      <span className="text-sm font-bold">${service.consultationFee}</span>
                    </div>
                  )}

                  {/* Rating */}
                  {service.rating && service.rating > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{service.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">({service.totalConsultations} consultations)</span>
                      </div>
                    </div>
                  )}

                  {/* Join Date */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Service Since</span>
                    <span className="text-sm">{new Date(service.joinDate).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="space-y-3">
            <Settings className="w-12 h-12 text-gray-400 mx-auto" />
            <h3 className="text-lg font-medium text-gray-900">No Provider Services</h3>
            <p className="text-gray-600">
              You don't have any provider service profiles yet. Add a professional role to get started.
            </p>
          </div>
        </Card>
      )}

      {/* System Benefits Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Unique Provider Service System
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Unique IDs per Role:</strong> Each professional role gets a unique service ID (e.g., doctor_001, nutritionist_001)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Separate Service Profiles:</strong> Different consultation fees, specializations, and availability per role</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Independent Booking:</strong> Patients book with specific provider IDs for different services</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Unified Communication:</strong> All messages still go to the same person across all service roles</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}