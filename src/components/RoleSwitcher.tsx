import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  UserCheck, 
  Plus, 
  Settings, 
  Stethoscope, 
  TestTube, 
  Utensils, 
  Brain, 
  Heart, 
  Pill, 
  Truck, 
  Users, 
  Activity,
  Crown,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface UserRole {
  id: string;
  role: string;
  status: 'active' | 'pending' | 'rejected';
  addedAt: string;
  specialization?: string;
  licenseNumber?: string;
}

interface RoleSwitcherProps {
  currentUser: {
    id: string;
    email: string;
    name: string;
    roles: UserRole[];
    currentRole: string;
  };
  onRoleSwitch: (roleId: string) => Promise<void>;
  onAddRole: (roleData: { role: string; specialization?: string; licenseNumber?: string; reason: string }) => Promise<void>;
}

const roleConfigs = {
  doctor: { title: 'Doctor', icon: Stethoscope, color: 'blue', requiresApproval: true },
  radiologist: { title: 'Radiologist', icon: Activity, color: 'purple', requiresApproval: true },
  lab_technician: { title: 'Lab Technician', icon: TestTube, color: 'green', requiresApproval: true },
  nutritionist: { title: 'Nutritionist', icon: Utensils, color: 'orange', requiresApproval: true },
  therapist: { title: 'Therapist', icon: Brain, color: 'indigo', requiresApproval: true },
  yoga_instructor: { title: 'Yoga Instructor', icon: Heart, color: 'pink', requiresApproval: true },
  pharmacy: { title: 'Pharmacy', icon: Pill, color: 'red', requiresApproval: true },
  food_service: { title: 'Food Service', icon: Truck, color: 'yellow', requiresApproval: true },
  community_manager: { title: 'Community Manager', icon: Users, color: 'cyan', requiresApproval: true },
  patient: { title: 'Patient', icon: Heart, color: 'teal', requiresApproval: false },
  admin: { title: 'Admin', icon: Settings, color: 'gray', requiresApproval: true }
};

export default function RoleSwitcher({ currentUser, onRoleSwitch, onAddRole }: RoleSwitcherProps) {
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRoleData, setNewRoleData] = useState({
    role: '',
    specialization: '',
    licenseNumber: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRoleSwitch = async (roleId: string) => {
    setLoading(true);
    try {
      await onRoleSwitch(roleId);
      toast({
        title: \"Role Switched\",
        description: `Successfully switched to ${roleConfigs[roleId as keyof typeof roleConfigs]?.title} role`,
      });
    } catch (error) {
      toast({
        title: \"Error\",
        description: \"Failed to switch role\",
        variant: \"destructive\"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!newRoleData.role || !newRoleData.reason) {
      toast({
        title: \"Error\",
        description: \"Please fill in all required fields\",
        variant: \"destructive\"
      });
      return;
    }

    setLoading(true);
    try {
      await onAddRole(newRoleData);
      setIsAddingRole(false);
      setNewRoleData({ role: '', specialization: '', licenseNumber: '', reason: '' });
      
      const config = roleConfigs[newRoleData.role as keyof typeof roleConfigs];
      toast({
        title: \"Role Request Submitted\",
        description: config?.requiresApproval 
          ? `Your ${config.title} role request has been submitted for approval`
          : `You now have access to the ${config.title} role`,
      });
    } catch (error) {
      toast({
        title: \"Error\",
        description: \"Failed to add role\",
        variant: \"destructive\"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: UserRole['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className=\"w-4 h-4 text-green-500\" />;
      case 'pending': return <Clock className=\"w-4 h-4 text-yellow-500\" />;
      case 'rejected': return <XCircle className=\"w-4 h-4 text-red-500\" />;
    }
  };

  const getStatusColor = (status: UserRole['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
    }
  };

  const availableRoles = Object.entries(roleConfigs).filter(
    ([roleKey]) => !currentUser.roles.some(r => r.role === roleKey)
  );

  return (
    <div className=\"space-y-6\">
      {/* Current Roles */}
      <Card>
        <CardHeader>
          <CardTitle className=\"flex items-center gap-2\">
            <UserCheck className=\"w-5 h-5\" />
            Your Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\">
            {currentUser.roles.map((userRole) => {
              const config = roleConfigs[userRole.role as keyof typeof roleConfigs];
              if (!config) return null;
              
              const IconComponent = config.icon;
              const isCurrentRole = userRole.role === currentUser.currentRole;
              
              return (
                <Card 
                  key={userRole.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isCurrentRole ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  } ${userRole.status !== 'active' ? 'opacity-60' : ''}`}
                >
                  <CardContent className=\"p-4\">
                    <div className=\"flex items-center justify-between mb-3\">
                      <div className={`p-2 rounded-lg bg-${config.color}-100`}>
                        <IconComponent className={`w-5 h-5 text-${config.color}-600`} />
                      </div>
                      <div className=\"flex items-center gap-2\">
                        {getStatusIcon(userRole.status)}
                        {isCurrentRole && <Crown className=\"w-4 h-4 text-yellow-500\" />}
                      </div>
                    </div>
                    
                    <h3 className=\"font-semibold text-sm mb-1\">{config.title}</h3>
                    <Badge 
                      variant=\"secondary\" 
                      className={`text-xs ${getStatusColor(userRole.status)}`}
                    >
                      {userRole.status.charAt(0).toUpperCase() + userRole.status.slice(1)}
                    </Badge>
                    
                    {userRole.specialization && (
                      <p className=\"text-xs text-gray-500 mt-2\">{userRole.specialization}</p>
                    )}
                    
                    <div className=\"mt-3 flex gap-2\">
                      {userRole.status === 'active' && !isCurrentRole && (
                        <Button
                          size=\"sm\"
                          variant=\"outline\"
                          onClick={() => handleRoleSwitch(userRole.role)}
                          disabled={loading}
                          className=\"text-xs\"
                        >
                          Switch
                        </Button>
                      )}
                      {isCurrentRole && (
                        <Badge variant=\"default\" className=\"text-xs\">
                          Active
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add New Role */}
      {availableRoles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className=\"flex items-center gap-2\">
              <Plus className=\"w-5 h-5\" />
              Add New Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={isAddingRole} onOpenChange={setIsAddingRole}>
              <DialogTrigger asChild>
                <Button variant=\"outline\" className=\"w-full\">
                  <Plus className=\"w-4 h-4 mr-2\" />
                  Request Additional Role
                </Button>
              </DialogTrigger>
              <DialogContent className=\"max-w-md\">
                <DialogHeader>
                  <DialogTitle>Request New Role</DialogTitle>
                </DialogHeader>
                
                <div className=\"space-y-4\">
                  <div>
                    <Label htmlFor=\"role\">Role *</Label>
                    <select
                      id=\"role\"
                      value={newRoleData.role}
                      onChange={(e) => setNewRoleData(prev => ({ ...prev, role: e.target.value }))}
                      className=\"w-full p-2 border rounded-md\"
                      required
                    >
                      <option value=\"\">Select a role</option>
                      {availableRoles.map(([roleKey, config]) => (
                        <option key={roleKey} value={roleKey}>{config.title}</option>
                      ))}
                    </select>
                  </div>

                  {newRoleData.role && roleConfigs[newRoleData.role as keyof typeof roleConfigs]?.requiresApproval && (
                    <>
                      <div>
                        <Label htmlFor=\"specialization\">Specialization</Label>
                        <Input
                          id=\"specialization\"
                          value={newRoleData.specialization}
                          onChange={(e) => setNewRoleData(prev => ({ ...prev, specialization: e.target.value }))}
                          placeholder=\"e.g., Prenatal Care, Cardiology\"
                        />
                      </div>

                      <div>
                        <Label htmlFor=\"license\">License Number</Label>
                        <Input
                          id=\"license\"
                          value={newRoleData.licenseNumber}
                          onChange={(e) => setNewRoleData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                          placeholder=\"Professional license number\"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor=\"reason\">Reason for Request *</Label>
                    <Textarea
                      id=\"reason\"
                      value={newRoleData.reason}
                      onChange={(e) => setNewRoleData(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder=\"Please explain why you need this additional role\"
                      required
                    />
                  </div>

                  <div className=\"flex gap-2\">
                    <Button
                      onClick={handleAddRole}
                      disabled={loading || !newRoleData.role || !newRoleData.reason}
                      className=\"flex-1\"
                    >
                      {loading ? 'Submitting...' : 'Submit Request'}
                    </Button>
                    <Button
                      variant=\"outline\"
                      onClick={() => setIsAddingRole(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Multi-Role Benefits Info */}
      <Card className=\"bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200\">
        <CardContent className=\"p-4\">
          <div className=\"flex items-start gap-3\">
            <div className=\"p-2 bg-blue-100 rounded-lg\">
              <Users className=\"w-5 h-5 text-blue-600\" />
            </div>
            <div>
              <h3 className=\"font-semibold text-blue-900 mb-1\">Multi-Role Benefits</h3>
              <ul className=\"text-sm text-blue-700 space-y-1\">
                <li>• Single login for multiple professional roles</li>
                <li>• Unified communication across all roles</li>
                <li>• Seamless patient data access (where authorized)</li>
                <li>• Consolidated billing and reporting</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}