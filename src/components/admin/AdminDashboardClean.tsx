import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  XCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import AdminForms from './AdminForms';
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
                firstName: patientData.personalInfo.firstName,
                lastName: patientData.personalInfo.lastName,
                email: patientData.personalInfo.email,
                phone: patientData.personalInfo.phone,
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
                firstName: providerData.personalInfo.firstName,
                lastName: providerData.personalInfo.lastName,
                email: providerData.personalInfo.email,
                phone: providerData.personalInfo.phone,
                specialization: providerData.personalInfo.specialization,
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
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
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
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
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
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Appointments & Scheduling</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Appointment
        </Button>
      </div>

      {/* Calendar View Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar View</CardTitle>
          <CardDescription>Manage appointments across all providers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Appointments Scheduled</h3>
            <p className="mb-4">Appointments will appear here once patients start booking</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 5. Packages & Subscription Component
function PackagesSubscription() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Packages & Subscription</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Package
        </Button>
      </div>

      {/* Package Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Packages will be loaded here */}
        <Card>
          <CardContent className="p-0">
            <div className="text-center py-12 text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Packages Created</h3>
              <p className="mb-4">Create subscription packages for your patients</p>
            </div>
          </CardContent>
        </Card>
      </div>
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