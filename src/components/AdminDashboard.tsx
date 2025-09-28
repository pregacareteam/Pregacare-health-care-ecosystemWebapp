import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  UserCheck, 
  AlertTriangle, 
  TrendingUp, 
  Settings, 
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  MessageCircle
} from "lucide-react";
import PatientProviderAssignmentManager, { PatientAssignment, ProviderAvailability } from "@/lib/patientProviderAssignmentManager";
import { ProviderServiceManager } from "@/lib/providerServiceManager";
import CommunicationPipelineDemo from "@/components/CommunicationPipelineDemo";

interface AdminDashboardProps {
  adminId: string;
  adminName: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminId, adminName }) => {
  const [assignments, setAssignments] = useState<PatientAssignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState('');

  // Load assignments on component mount
  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = () => {
    const allAssignments = PatientProviderAssignmentManager.getPatientAssignments();
    setAssignments(allAssignments);
  };

  // Generate sample data for demonstration
  const generateSampleData = () => {
    const samplePatients = [
      { id: 'patient_001', name: 'Sarah Johnson', phone: '+1-555-0101', email: 'sarah.j@email.com' },
      { id: 'patient_002', name: 'Maria Rodriguez', phone: '+1-555-0102', email: 'maria.r@email.com' },
      { id: 'patient_003', name: 'Emily Chen', phone: '+1-555-0103', email: 'emily.c@email.com' },
      { id: 'patient_004', name: 'Jessica Williams', phone: '+1-555-0104', email: 'jessica.w@email.com' },
      { id: 'patient_005', name: 'Amanda Davis', phone: '+1-555-0105', email: 'amanda.d@email.com' }
    ];

    const serviceTypes = ['doctor', 'nutritionist', 'therapist', 'yoga_instructor'];
    const providers = ProviderServiceManager.getAllProviders();

    samplePatients.forEach((patient, index) => {
      // Assign 2-3 services per patient
      const servicesToAssign = serviceTypes.slice(0, 2 + (index % 2));
      
      servicesToAssign.forEach(serviceType => {
        const availableProviders = providers.filter(p => p.roleType === serviceType);
        if (availableProviders.length > 0) {
          const randomProvider = availableProviders[index % availableProviders.length];
          
          PatientProviderAssignmentManager.assignProviderToPatient(
            patient.id,
            patient.name,
            serviceType,
            randomProvider.id,
            randomProvider.providerName,
            adminId,
            `Auto-assigned based on availability and specialization`
          );
        }
      });
    });

    loadAssignments();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Handle new assignment
  const handleAssignProvider = () => {
    if (!selectedPatient || !selectedService || !selectedProvider) {
      setShowError('Please select patient, service, and provider');
      setTimeout(() => setShowError(''), 3000);
      return;
    }

    const providers = ProviderServiceManager.getAllProviders();
    const provider = providers.find(p => p.id === selectedProvider);
    
    if (!provider) {
      setShowError('Provider not found');
      setTimeout(() => setShowError(''), 3000);
      return;
    }

    const result = PatientProviderAssignmentManager.assignProviderToPatient(
      selectedPatient,
      `Patient ${selectedPatient}`, // In real app, would get actual name
      selectedService,
      provider.id,
      provider.providerName,
      adminId,
      assignmentNotes
    );

    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setSelectedPatient('');
      setSelectedService('');
      setSelectedProvider('');
      setAssignmentNotes('');
      loadAssignments();
    } else {
      setShowError(result.error || 'Failed to assign provider');
      setTimeout(() => setShowError(''), 3000);
    }
  };

  // Filter assignments based on search
  const filteredAssignments = assignments.filter(assignment =>
    assignment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get assignment statistics
  const stats = PatientProviderAssignmentManager.generateAssignmentReport();

  // Get available providers for selected service
  const getAvailableProviders = (serviceType: string) => {
    const providers = ProviderServiceManager.getAllProviders();
    return providers.filter(p => p.roleType === serviceType);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage patient-provider assignments</p>
        </div>
        <Button onClick={generateSampleData} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Generate Sample Data
        </Button>
      </div>

      {/* Success/Error Alerts */}
      {showSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Operation completed successfully!
          </AlertDescription>
        </Alert>
      )}

      {showError && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {showError}
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Providers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProviders}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unassigned</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unassignedPatients}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overloaded</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overloadedProviders.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="assignments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assignments">Patient Assignments</TabsTrigger>
          <TabsTrigger value="new-assignment">New Assignment</TabsTrigger>
          <TabsTrigger value="communication">Communication Pipeline</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Patient Assignments Tab */}
        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Patient-Provider Assignments</CardTitle>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAssignments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No patient assignments found</p>
                    <p className="text-sm">Start by generating sample data or creating new assignments</p>
                  </div>
                ) : (
                  filteredAssignments.map((assignment) => (
                    <Card key={assignment.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-lg">{assignment.patientName}</h3>
                              <Badge variant="secondary">{assignment.patientId}</Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {Object.entries(assignment.assignments).map(([serviceType, assignmentData]) => (
                                <div key={serviceType} className="space-y-1">
                                  <p className="text-sm font-medium text-gray-600 capitalize">
                                    {serviceType.replace('_', ' ')}
                                  </p>
                                  <div className="flex items-center space-x-2">
                                    <Badge 
                                      variant={assignmentData.status === 'active' ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {assignmentData.providerName}
                                    </Badge>
                                    {assignmentData.status === 'active' ? (
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                    ) : assignmentData.status === 'inactive' ? (
                                      <XCircle className="h-3 w-3 text-red-500" />
                                    ) : (
                                      <Clock className="h-3 w-3 text-orange-500" />
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {new Date(assignmentData.assignedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                            
                            <p className="text-xs text-gray-500">
                              Last updated: {new Date(assignment.updatedAt).toLocaleString()}
                            </p>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Assignment Tab */}
        <TabsContent value="new-assignment">
          <Card>
            <CardHeader>
              <CardTitle>Create New Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Patient ID</Label>
                  <Input
                    id="patient"
                    placeholder="Enter patient ID (e.g., patient_001)"
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Tip: Use patient_001, patient_002, etc.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service">Service Type</Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor/Gynecologist</SelectItem>
                      <SelectItem value="nutritionist">Nutritionist</SelectItem>
                      <SelectItem value="therapist">Therapist</SelectItem>
                      <SelectItem value="yoga_instructor">Yoga Instructor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedService && (
                <div className="space-y-2">
                  <Label htmlFor="provider">Available Providers</Label>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableProviders(selectedService).map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.providerName} ({provider.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Assignment Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any notes about this assignment..."
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                />
              </div>

              <Button onClick={handleAssignProvider} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Pipeline Tab */}
        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <CardTitle>Automatic Communication Pipeline</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4 border-blue-200 bg-blue-50">
                <MessageCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Live Demo:</strong> Once admin assigns providers to patients, they can automatically 
                  communicate with each other about that specific patient without manual lookup!
                </AlertDescription>
              </Alert>
              
              <CommunicationPipelineDemo />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Assignments by Service Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.assignmentsByService).map(([service, count]) => (
                    <div key={service} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {service.replace('_', ' ')}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(count / Math.max(...Object.values(stats.assignmentsByService))) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Assignment System</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      <span>Provider Services</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Online
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-purple-500" />
                      <span>Patient Management</span>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      Operational
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;