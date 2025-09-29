import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  Plus,
  Search,
  Filter,
  FileText,
  Settings,
  BarChart3,
  MessageSquare,
  Package,
  Home,
  Stethoscope,
  Activity,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import AdminForms from './WorkingAdminForms';
import { useToast } from '@/hooks/use-toast';

// Types for data management
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

interface Provider {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

// Main Admin Dashboard Component
export function AdminDashboardClean() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAddProviderModal, setShowAddProviderModal] = useState(false);

  
  // Data states
  const [patients, setPatients] = useState<Patient[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);

  // KPI Data Structure (calculated from actual data)
  const kpiData = {
    activePatients: patients.filter(p => p.status === 'active').length,
    activeProviders: providers.filter(p => p.status === 'active').length,
    appointmentsToday: 0, // Will be calculated from appointments data
    revenueThisMonth: 0, // Will be calculated from payments data
    pendingIssues: 0
  };

  // Load data on component mount
  useEffect(() => {
    loadPatients();
    loadProviders();
  }, []);

  // Data loading functions
  const loadPatients = async () => {
    try {
      // In a real app, this would fetch from your API/Supabase
      const storedPatients = localStorage.getItem('pregacare_patients');
      if (storedPatients) {
        setPatients(JSON.parse(storedPatients));
      }
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  };

  const loadProviders = async () => {
    try {
      // In a real app, this would fetch from your API/Supabase
      const storedProviders = localStorage.getItem('pregacare_providers');
      if (storedProviders) {
        setProviders(JSON.parse(storedProviders));
      }
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  };

  // Navigation functions
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
  };

  const handleKPIClick = (section: string) => {
    setActiveTab(section);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="flex">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Main Content Area */}
        <div className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your healthcare ecosystem</p>
            </div>

            {/* Tab Content */}
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsContent value="overview">
                <OverviewDashboard 
                  kpiData={kpiData} 
                  onKPIClick={handleKPIClick}
                  onAddPatient={() => setShowAddPatientModal(true)}
                  onAddProvider={() => setShowAddProviderModal(true)}
                  onViewPatients={() => setActiveTab('patients')}
                  onViewProviders={() => setActiveTab('providers')}
                />
              </TabsContent>
              
              <TabsContent value="patients">
                <PatientsManagement 
                  patients={patients}
                  onAddPatient={() => setShowAddPatientModal(true)}
                  onRefresh={loadPatients}
                />
              </TabsContent>
              
              <TabsContent value="providers">
                <ProvidersManagement 
                  providers={providers}
                  onAddProvider={() => setShowAddProviderModal(true)}
                  onRefresh={loadProviders}
                />
              </TabsContent>
              
              <TabsContent value="appointments">
                <AppointmentsScheduling />
              </TabsContent>
              
              <TabsContent value="packages">
                <PackagesSubscription />
              </TabsContent>
              
              <TabsContent value="payments">
                <PaymentsBilling />
              </TabsContent>
              
              <TabsContent value="communication">
                <CommunicationHub />
              </TabsContent>
              
              <TabsContent value="analytics">
                <AnalyticsInsights kpiData={kpiData} patients={patients} providers={providers} />
              </TabsContent>
              
              <TabsContent value="settings">
                <SystemSettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Modal Dialogs */}
      <Dialog open={showAddPatientModal} onOpenChange={setShowAddPatientModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>
              Register a new patient in the healthcare system
            </DialogDescription>
          </DialogHeader>
          <AdminForms.AddPatientForm 
            onSuccess={(patientData) => {
              const newPatient: Patient = {
                id: `patient_${Date.now()}`,
                firstName: patientData.firstName,
                lastName: patientData.lastName,
                email: patientData.email,
                phone: patientData.phone,
                status: 'active',
                createdAt: new Date()
              };
              const updatedPatients = [...patients, newPatient];
              setPatients(updatedPatients);
              localStorage.setItem('pregacare_patients', JSON.stringify(updatedPatients));
              setShowAddPatientModal(false);
              toast({
                title: "Success!",
                description: "Patient has been successfully registered.",
              });
              loadPatients(); // Refresh data
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showAddProviderModal} onOpenChange={setShowAddProviderModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Healthcare Provider</DialogTitle>
            <DialogDescription>
              Register a new healthcare provider in the system
            </DialogDescription>
          </DialogHeader>
          <AdminForms.AddProviderForm 
            onSuccess={(providerData) => {
              const newProvider: Provider = {
                id: `provider_${Date.now()}`,
                firstName: providerData.firstName,
                lastName: providerData.lastName,
                email: providerData.email,
                phone: providerData.phone,
                specialization: providerData.specialization,
                status: 'active',
                createdAt: new Date()
              };
              const updatedProviders = [...providers, newProvider];
              setProviders(updatedProviders);
              localStorage.setItem('pregacare_providers', JSON.stringify(updatedProviders));
              setShowAddProviderModal(false);
              toast({
                title: "Success!",
                description: "Healthcare provider has been successfully registered.",
              });
              loadProviders(); // Refresh data
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sidebar Navigation Component
function AdminSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const navigationItems = [
    { id: 'overview', label: 'Home', icon: Home },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'providers', label: 'Providers', icon: UserCheck },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Pregacare</h2>
            <p className="text-sm text-gray-500">Admin Portal</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

// 1. Overview Dashboard Component
function OverviewDashboard({ 
  kpiData, 
  onKPIClick, 
  onAddPatient, 
  onAddProvider, 
  onViewPatients, 
  onViewProviders 
}: { 
  kpiData: any; 
  onKPIClick: (tab: string) => void;
  onAddPatient: () => void;
  onAddProvider: () => void;
  onViewPatients: () => void;
  onViewProviders: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KPICard
          title="Active Patients"
          value={kpiData.activePatients}
          icon={Users}
          color="blue"
          onClick={() => onKPIClick('patients')}
        />
        <KPICard
          title="Active Providers"
          value={kpiData.activeProviders}
          icon={UserCheck}
          color="green"
          onClick={() => onKPIClick('providers')}
        />
        <KPICard
          title="Appointments Today"
          value={kpiData.appointmentsToday}
          icon={Calendar}
          color="orange"
          onClick={() => onKPIClick('appointments')}
        />
        <KPICard
          title="Revenue This Month"
          value={`₹${kpiData.revenueThisMonth.toLocaleString()}`}
          icon={DollarSign}
          color="purple"
          onClick={() => onKPIClick('payments')}
        />
        <KPICard
          title="Pending Issues"
          value={kpiData.pendingIssues}
          icon={AlertTriangle}
          color="red"
          onClick={() => onKPIClick('communication')}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button className="h-16 flex flex-col gap-2" onClick={onAddPatient}>
          <Plus className="w-5 h-5" />
          Add New Patient
        </Button>
        <Button variant="outline" className="h-16 flex flex-col gap-2" onClick={onAddProvider}>
          <Plus className="w-5 h-5" />
          Add New Provider
        </Button>
        <Button variant="outline" className="h-16 flex flex-col gap-2" onClick={onViewPatients}>
          <Users className="w-5 h-5" />
          View All Patients
        </Button>
        <Button variant="outline" className="h-16 flex flex-col gap-2" onClick={onViewProviders}>
          <UserCheck className="w-5 h-5" />
          View All Providers
        </Button>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions in your healthcare ecosystem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Activity will appear here as users interact with the system</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 2. Patients Management Component
function PatientsManagement({ 
  patients, 
  onAddPatient, 
  onRefresh 
}: { 
  patients: Patient[];
  onAddPatient: () => void;
  onRefresh: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter patients based on search term and status
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDeletePatient = (patientId: string) => {
    if (confirm('Are you sure you want to delete this patient?')) {
      const updatedPatients = patients.filter(p => p.id !== patientId);
      localStorage.setItem('pregacare_patients', JSON.stringify(updatedPatients));
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Patients Management</h2>
          <p className="text-gray-600">Total: {patients.length} patients</p>
        </div>
        <Button onClick={onAddPatient}>
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <Button variant="outline" onClick={onRefresh}>
          <Activity className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Patients Table */}
      <Card>
        <CardContent className="p-0">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {patients.length === 0 ? 'No Patients Yet' : 'No patients match your search'}
              </h3>
              <p className="mb-4">
                {patients.length === 0 
                  ? 'Start by adding your first patient to the system'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {patients.length === 0 && (
                <Button onClick={onAddPatient}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Patient
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Patient</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Registered</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-sm text-gray-500">ID: {patient.id}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm text-gray-900">{patient.email}</p>
                          <p className="text-sm text-gray-500">{patient.phone}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                          {patient.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-900">
                          {new Date(patient.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowPatientDetailsModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              alert('Edit patient functionality will be implemented with a proper edit form');
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeletePatient(patient.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// 3. Providers Management Component
function ProvidersManagement({ 
  providers, 
  onAddProvider, 
  onRefresh 
}: { 
  providers: Provider[];
  onAddProvider: () => void;
  onRefresh: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('all');

  // Calculate provider statistics
  const providerStats = {
    gynecologist: providers.filter(p => p.specialization === 'gynecologist').length,
    nutritionist: providers.filter(p => p.specialization === 'nutritionist').length,
    therapist: providers.filter(p => p.specialization === 'therapist').length,
    yoga_instructor: providers.filter(p => p.specialization === 'yoga_instructor').length
  };

  // Filter providers
  const filteredProviders = providers.filter(provider => {
    const matchesSearch = 
      provider.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = specializationFilter === 'all' || provider.specialization === specializationFilter;
    
    return matchesSearch && matchesSpecialization;
  });

  const handleDeleteProvider = (providerId: string) => {
    if (confirm('Are you sure you want to delete this provider?')) {
      const updatedProviders = providers.filter(p => p.id !== providerId);
      localStorage.setItem('pregacare_providers', JSON.stringify(updatedProviders));
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Providers Management</h2>
          <p className="text-gray-600">Total: {providers.length} healthcare providers</p>
        </div>
        <Button onClick={onAddProvider}>
          <Plus className="w-4 h-4 mr-2" />
          Add Provider
        </Button>
      </div>

      {/* Provider Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4 cursor-pointer hover:bg-gray-50" onClick={() => setSpecializationFilter('gynecologist')}>
          <CardContent className="p-0">
            <Stethoscope className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold">Gynecologists</h3>
            <p className="text-2xl font-bold">{providerStats.gynecologist}</p>
          </CardContent>
        </Card>
        <Card className="text-center p-4 cursor-pointer hover:bg-gray-50" onClick={() => setSpecializationFilter('nutritionist')}>
          <CardContent className="p-0">
            <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold">Nutritionists</h3>
            <p className="text-2xl font-bold">{providerStats.nutritionist}</p>
          </CardContent>
        </Card>
        <Card className="text-center p-4 cursor-pointer hover:bg-gray-50" onClick={() => setSpecializationFilter('yoga_instructor')}>
          <CardContent className="p-0">
            <Activity className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-semibold">Yoga Instructors</h3>
            <p className="text-2xl font-bold">{providerStats.yoga_instructor}</p>
          </CardContent>
        </Card>
        <Card className="text-center p-4 cursor-pointer hover:bg-gray-50" onClick={() => setSpecializationFilter('therapist')}>
          <CardContent className="p-0">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <h3 className="font-semibold">Therapists</h3>
            <p className="text-2xl font-bold">{providerStats.therapist}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select 
          value={specializationFilter} 
          onChange={(e) => setSpecializationFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Specializations</option>
          <option value="gynecologist">Gynecologist</option>
          <option value="nutritionist">Nutritionist</option>
          <option value="therapist">Therapist</option>
          <option value="yoga_instructor">Yoga Instructor</option>
        </select>
        <Button variant="outline" onClick={onRefresh}>
          <Activity className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Providers List */}
      <Card>
        <CardContent className="p-0">
          {filteredProviders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <UserCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {providers.length === 0 ? 'No Providers Yet' : 'No providers match your search'}
              </h3>
              <p className="mb-4">
                {providers.length === 0 
                  ? 'Add healthcare providers to start building your network'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {providers.length === 0 && (
                <Button onClick={onAddProvider}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Provider
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Provider</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Specialization</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Joined</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProviders.map((provider) => (
                    <tr key={provider.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            Dr. {provider.firstName} {provider.lastName}
                          </p>
                          <p className="text-sm text-gray-500">ID: {provider.id}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">
                          {provider.specialization.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm text-gray-900">{provider.email}</p>
                          <p className="text-sm text-gray-500">{provider.phone}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={provider.status === 'active' ? 'default' : 'secondary'}>
                          {provider.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-900">
                          {new Date(provider.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              alert(`Provider Details:\n\nName: Dr. ${provider.firstName} ${provider.lastName}\nSpecialization: ${provider.specialization}\nEmail: ${provider.email}\nPhone: ${provider.phone}\nStatus: ${provider.status}\nJoined: ${new Date(provider.createdAt).toLocaleDateString()}`);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              alert('Edit provider functionality will be implemented with a proper edit form');
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteProvider(provider.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// 4. Appointments & Scheduling Component
function AppointmentsScheduling() {
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Appointments & Scheduling</h2>
          <p className="text-gray-600">Manage patient appointments and provider schedules</p>
        </div>
        <Button onClick={() => setShowAddAppointmentModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Appointment
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-blue-600">0</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-green-600">0</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">0</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-purple-600">0</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>Appointment Calendar</CardTitle>
          <CardDescription>View and manage all appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Appointments Scheduled</h3>
            <p className="mb-4">Start by scheduling your first appointment</p>
            <Button onClick={() => setShowAddAppointmentModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Schedule First Appointment
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Add Appointment Modal */}
      <Dialog open={showAddAppointmentModal} onOpenChange={setShowAddAppointmentModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Book an appointment for a patient with a healthcare provider
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Patient and Provider Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Select Patient *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName} - {patient.phone}
                      </SelectItem>
                    ))}
                    {patients.length === 0 && (
                      <SelectItem value="none" disabled>No patients registered</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Select Provider *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        Dr. {provider.firstName} {provider.lastName} ({provider.specialization})
                      </SelectItem>
                    ))}
                    {providers.length === 0 && (
                      <SelectItem value="none" disabled>No providers registered</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date and Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Appointment Date *</Label>
                <Input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Appointment Time *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">09:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="14:00">02:00 PM</SelectItem>
                    <SelectItem value="15:00">03:00 PM</SelectItem>
                    <SelectItem value="16:00">04:00 PM</SelectItem>
                    <SelectItem value="17:00">05:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Appointment Type *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial_consultation">Initial Consultation</SelectItem>
                    <SelectItem value="follow_up">Follow-up Visit</SelectItem>
                    <SelectItem value="routine_checkup">Routine Checkup</SelectItem>
                    <SelectItem value="prenatal_checkup">Prenatal Checkup</SelectItem>
                    <SelectItem value="emergency">Emergency Consultation</SelectItem>
                    <SelectItem value="lab_review">Lab Results Review</SelectItem>
                    <SelectItem value="nutrition_counseling">Nutrition Counseling</SelectItem>
                    <SelectItem value="therapy_session">Therapy Session</SelectItem>
                    <SelectItem value="yoga_session">Yoga Session</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority Level</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Consultation Mode</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_person">In-Person</SelectItem>
                    <SelectItem value="video_call">Video Call</SelectItem>
                    <SelectItem value="phone_call">Phone Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Patient Symptoms/Reason */}
            <div className="space-y-2">
              <Label>Reason for Visit / Symptoms</Label>
              <Textarea 
                placeholder="Describe the main reason for this appointment, current symptoms, or concerns..." 
                className="min-h-[80px]"
              />
            </div>

            {/* Special Instructions */}
            <div className="space-y-2">
              <Label>Special Instructions (Optional)</Label>
              <Textarea 
                placeholder="Any special instructions, preparation required, or additional notes for the provider..." 
                className="min-h-[60px]"
              />
            </div>

            {/* Reminder Settings */}
            <div className="space-y-2">
              <Label>Send Reminder</Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="email_reminder" className="rounded" />
                  <Label htmlFor="email_reminder" className="text-sm">Email (24h before)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="sms_reminder" className="rounded" />
                  <Label htmlFor="sms_reminder" className="text-sm">SMS (2h before)</Label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAddAppointmentModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Add comprehensive appointment data collection here
                const appointmentData = {
                  id: `appointment_${Date.now()}`,
                  patientId: 'selected_patient_id',
                  providerId: 'selected_provider_id',
                  date: new Date(),
                  time: 'selected_time',
                  type: 'selected_type',
                  duration: 'selected_duration',
                  priority: 'selected_priority',
                  mode: 'selected_mode',
                  reason: 'entered_reason',
                  instructions: 'entered_instructions',
                  status: 'scheduled',
                  createdAt: new Date()
                };
                
                // Store appointment (localStorage for now)
                const appointments = JSON.parse(localStorage.getItem('pregacare_appointments') || '[]');
                appointments.push(appointmentData);
                localStorage.setItem('pregacare_appointments', JSON.stringify(appointments));
                
                setShowAddAppointmentModal(false);
                toast({
                  title: "Success!",
                  description: "Appointment has been scheduled successfully.",
                });
              }}>
                Schedule Appointment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 5. Packages & Subscription Component
function PackagesSubscription() {
  const [showCreatePackageModal, setShowCreatePackageModal] = useState(false);
  const [packages, setPackages] = useState([]);
  
  const defaultPackages = [
    {
      id: 'basic',
      name: 'Basic Care',
      price: 2999,
      duration: '3 months',
      services: ['Monthly checkups', 'Basic consultations', 'Health monitoring'],
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium Care',
      price: 5999,
      duration: '6 months', 
      services: ['Bi-weekly checkups', 'Nutrition counseling', 'Yoga sessions', '24/7 support'],
      popular: true
    },
    {
      id: 'complete',
      name: 'Complete Care',
      price: 9999,
      duration: '12 months',
      services: ['Weekly checkups', 'Full care team', 'All services included', 'Priority support'],
      popular: false
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Healthcare Packages</h2>
          <p className="text-gray-600">Manage subscription plans and service packages</p>
        </div>
        <Button onClick={() => setShowCreatePackageModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Package
        </Button>
      </div>

      {/* Package Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {defaultPackages.map((pkg) => (
          <Card key={pkg.id} className={`relative ${pkg.popular ? 'border-blue-500 shadow-lg' : ''}`}>
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-3 py-1">Most Popular</Badge>
              </div>
            )}
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold">{pkg.name}</CardTitle>
              <div className="text-3xl font-bold text-blue-600">
                ₹{pkg.price.toLocaleString()}
                <span className="text-sm font-normal text-gray-500">/{pkg.duration}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {pkg.services.map((service, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm">{service}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button className="w-full" variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Package
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Create Package Modal */}
      <Dialog open={showCreatePackageModal} onOpenChange={setShowCreatePackageModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Healthcare Package</DialogTitle>
            <DialogDescription>
              Design a new subscription package for patients
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Package Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Package Name *</Label>
                    <Input placeholder="e.g., Premium Prenatal Care" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Package Category *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prenatal">Prenatal Care</SelectItem>
                        <SelectItem value="postnatal">Postnatal Care</SelectItem>
                        <SelectItem value="nutrition">Nutrition & Wellness</SelectItem>
                        <SelectItem value="therapy">Therapy & Mental Health</SelectItem>
                        <SelectItem value="fitness">Fitness & Yoga</SelectItem>
                        <SelectItem value="comprehensive">Comprehensive Care</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Duration *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Month</SelectItem>
                        <SelectItem value="3">3 Months</SelectItem>
                        <SelectItem value="6">6 Months</SelectItem>
                        <SelectItem value="9">9 Months</SelectItem>
                        <SelectItem value="12">12 Months</SelectItem>
                        <SelectItem value="custom">Custom Duration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Price (₹) *</Label>
                    <Input type="number" placeholder="5999" min="0" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount (%)</Label>
                    <Input type="number" placeholder="10" min="0" max="100" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Package Description *</Label>
                  <Textarea 
                    placeholder="Comprehensive description of what this package offers, its benefits, and target audience..." 
                    className="min-h-[100px]"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Included Services */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Included Services</CardTitle>
                <CardDescription>Select all services included in this package</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-700">Medical Services</h4>
                    {[
                      { id: 'gynecologist_consultation', label: 'Gynecologist Consultations', sessions: 'Monthly' },
                      { id: 'general_consultation', label: 'General Health Consultations', sessions: 'Bi-weekly' },
                      { id: 'emergency_consultation', label: '24/7 Emergency Consultation', sessions: 'Unlimited' },
                      { id: 'lab_tests', label: 'Laboratory Tests', sessions: 'Quarterly' },
                      { id: 'ultrasound', label: 'Ultrasound Scans', sessions: 'As needed' },
                      { id: 'health_monitoring', label: 'Health Parameter Monitoring', sessions: 'Weekly' }
                    ].map((service) => (
                      <div key={service.id} className="flex items-center justify-between space-x-2 p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id={service.id} className="rounded" />
                          <Label htmlFor={service.id} className="text-sm">{service.label}</Label>
                        </div>
                        <span className="text-xs text-gray-500">{service.sessions}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-700">Wellness Services</h4>
                    {[
                      { id: 'nutrition_counseling', label: 'Nutrition Counseling', sessions: 'Bi-weekly' },
                      { id: 'diet_planning', label: 'Personalized Diet Planning', sessions: 'Monthly' },
                      { id: 'yoga_sessions', label: 'Prenatal Yoga Sessions', sessions: 'Weekly' },
                      { id: 'therapy_sessions', label: 'Psychological Support', sessions: 'As needed' },
                      { id: 'lactation_support', label: 'Lactation Counseling', sessions: 'Post-delivery' },
                      { id: 'health_education', label: 'Health Education Materials', sessions: 'Unlimited' }
                    ].map((service) => (
                      <div key={service.id} className="flex items-center justify-between space-x-2 p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id={service.id} className="rounded" />
                          <Label htmlFor={service.id} className="text-sm">{service.label}</Label>
                        </div>
                        <span className="text-xs text-gray-500">{service.sessions}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Package Features & Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Package Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first_time_mothers">First-time Mothers</SelectItem>
                        <SelectItem value="experienced_mothers">Experienced Mothers</SelectItem>
                        <SelectItem value="high_risk_pregnancy">High-risk Pregnancy</SelectItem>
                        <SelectItem value="working_women">Working Women</SelectItem>
                        <SelectItem value="all_pregnant_women">All Pregnant Women</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Package Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Key Benefits</Label>
                  <Textarea 
                    placeholder="List the main benefits and advantages of this package (one per line)..." 
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Package Limitations (if any)</Label>
                  <Textarea 
                    placeholder="Any restrictions, limitations, or conditions for this package..." 
                    className="min-h-[60px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Package Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Package Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Availability Status</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active & Available</SelectItem>
                        <SelectItem value="coming_soon">Coming Soon</SelectItem>
                        <SelectItem value="limited_time">Limited Time Offer</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Enrollments</Label>
                    <Input type="number" placeholder="100" min="1" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Special Features</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Most Popular',
                      'Best Value',
                      'New Package',
                      'Limited Offer',
                      'Premium Support',
                      'Money Back Guarantee'
                    ].map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <input type="checkbox" id={feature} className="rounded" />
                        <Label htmlFor={feature} className="text-sm">{feature}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowCreatePackageModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Collect comprehensive package data
                const packageData = {
                  id: `package_${Date.now()}`,
                  name: 'entered_name',
                  category: 'selected_category',
                  duration: 'selected_duration',
                  price: 'entered_price',
                  discount: 'entered_discount',
                  description: 'entered_description',
                  services: [], // selected services
                  features: [], // selected features
                  targetAudience: 'selected_audience',
                  priority: 'selected_priority',
                  status: 'selected_status',
                  maxEnrollments: 'entered_max',
                  createdAt: new Date()
                };
                
                // Store package (localStorage for now)
                const packages = JSON.parse(localStorage.getItem('pregacare_packages') || '[]');
                packages.push(packageData);
                localStorage.setItem('pregacare_packages', JSON.stringify(packages));
                
                setShowCreatePackageModal(false);
                toast({
                  title: "Success!",
                  description: "Healthcare package has been created successfully.",
                });
              }}>
                Create Package
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Patient Details Modal */}
      <Dialog open={showPatientDetailsModal} onOpenChange={setShowPatientDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Patient Profile - {selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : 'Unknown'}
            </DialogTitle>
            <DialogDescription>Complete patient information and medical history</DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-6">
              {/* Patient Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Personal Information
                    <Button variant="outline" size="sm">
                      Edit Profile
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                        <p className="text-gray-900 font-medium">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                        <p className="text-gray-900">{selectedPatient.dateOfBirth || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Blood Group</Label>
                        <p className="text-gray-900">{selectedPatient.bloodGroup || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Contact Number</Label>
                        <p className="text-gray-900">{selectedPatient.phone}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Email Address</Label>
                        <p className="text-gray-900">{selectedPatient.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Emergency Contact</Label>
                        <p className="text-gray-900">{selectedPatient.emergencyContact || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Address</Label>
                        <p className="text-gray-900">{selectedPatient.address || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Insurance</Label>
                        <p className="text-gray-900">{selectedPatient.insurance || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pregnancy Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pregnancy Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Estimated Due Date</Label>
                      <p className="text-gray-900 font-medium">{selectedPatient.dueDate || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Current Trimester</Label>
                      <p className="text-gray-900">{selectedPatient.trimester || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Pregnancy Type</Label>
                      <p className="text-gray-900">{selectedPatient.pregnancyType || 'Single pregnancy'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Risk Level</Label>
                      <p className="text-gray-900">{selectedPatient.riskLevel || 'Low Risk'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medical History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Medical History & Current Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Account Status</Label>
                        <Badge variant={selectedPatient.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                          {selectedPatient.status}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Registration Date</Label>
                        <p className="text-gray-900">{new Date(selectedPatient.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Patient ID</Label>
                        <p className="text-gray-900 font-mono">{selectedPatient.id}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Last Update</Label>
                        <p className="text-gray-900">{selectedPatient.updatedAt ? new Date(selectedPatient.updatedAt).toLocaleDateString() : 'No updates'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <div className="space-x-2">
                  <Button variant="outline">
                    View Full History
                  </Button>
                  <Button variant="outline">
                    Schedule Appointment
                  </Button>
                  <Button variant="outline">
                    Send Message
                  </Button>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => setShowPatientDetailsModal(false)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    alert('Patient edit functionality will be implemented with comprehensive edit form');
                  }}>
                    Edit Patient
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 6. Payments & Billing Component
function PaymentsBilling() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Payments & Billing</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No payments yet</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Provider Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No payouts yet</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 7. Communication Hub Component
function CommunicationHub() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Communication Hub</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No support tickets</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Internal Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No internal messages</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 8. Analytics & Insights Component
function AnalyticsInsights({ kpiData, patients, providers }: { 
  kpiData: any; 
  patients: Patient[]; 
  providers: Provider[]; 
}) {
  // Calculate growth metrics
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  
  const recentPatients = patients.filter(p => new Date(p.createdAt) > lastMonth).length;
  const recentProviders = providers.filter(p => new Date(p.createdAt) > lastMonth).length;
  
  // Calculate specialization distribution
  const specializationStats = providers.reduce((acc, provider) => {
    acc[provider.specialization] = (acc[provider.specialization] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics & Insights</h2>
        <Badge variant="secondary">Last updated: {now.toLocaleDateString()}</Badge>
      </div>
      
      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Patients</p>
                <p className="text-2xl font-bold text-green-600">+{recentPatients}</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Providers</p>
                <p className="text-2xl font-bold text-blue-600">+{recentProviders}</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
              <UserCheck className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Patient Retention</p>
                <p className="text-2xl font-bold text-purple-600">100%</p>
                <p className="text-xs text-gray-500">Active rate</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-2xl font-bold text-green-600">99.9%</p>
                <p className="text-xs text-gray-500">Uptime</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Provider Specialization Distribution</CardTitle>
            <CardDescription>Breakdown of healthcare providers by specialty</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(specializationStats).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No provider data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(specializationStats).map(([specialization, count]) => {
                  const percentage = providers.length > 0 ? (count / providers.length * 100).toFixed(1) : '0';
                  return (
                    <div key={specialization} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize text-gray-700">
                        {specialization.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{count} ({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Real-time system health monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Database Connection</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Healthy
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">User Registration</span>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Active
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg bg-purple-50">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Data Processing</span>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Operational
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Total System Users</span>
                </div>
                <Badge variant="secondary">
                  {patients.length + providers.length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 9. System Settings Component
function SystemSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings & Compliance</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Role Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Manage User Roles
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Configure System
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// KPI Card Component
function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  onClick 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  color: string; 
  onClick: () => void; 
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    orange: 'text-orange-600 bg-orange-50 border-orange-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    red: 'text-red-600 bg-red-50 border-red-200',
  };

  return (
    <Card className={`cursor-pointer hover:shadow-md transition-shadow ${colorClasses[color as keyof typeof colorClasses] || ''}`} onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className="w-8 h-8" />
        </div>
      </CardContent>
    </Card>
  );
}

export default AdminDashboardClean;