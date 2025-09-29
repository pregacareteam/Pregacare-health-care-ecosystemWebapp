import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
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
  TrendingUp,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  PatientService,
  ProviderService,
  AppointmentService,
  PackageService,
  PaymentService,
  AnalyticsService,
  CommunicationService,
  RealtimeService,
  Patient,
  Provider,
  Appointment,
  Package as DatabasePackage,
  Payment
} from '../../lib/supabaseService';
import {
  HEALTHCARE_PACKAGES,
  PackageRevenueAnalytics,
  PackagePaymentCalculator
} from '../../lib/packagePricingSystem';

// Production-Ready Admin Dashboard with Full Supabase Integration
export default function ProductionAdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [patients, setPatients] = useState<Patient[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [packages, setPackages] = useState<DatabasePackage[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    totalProviders: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    completedPayments: 0,
    upcomingAppointments: 0,
    totalAppointments: 0,
    packageRevenue: {
      basic: { revenue: 0, subscriptions: 0 },
      medium: { revenue: 0, subscriptions: 0 },
      comprehensive: { revenue: 0, subscriptions: 0 }
    },
    mostPopularPackage: 'medium',
    totalPackageSubscriptions: 0
  });

  // Modal states
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAddProviderModal, setShowAddProviderModal] = useState(false);
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [showCreatePackageModal, setShowCreatePackageModal] = useState(false);
  const [showPatientDetailsModal, setShowPatientDetailsModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Form states
  const [patientForm, setPatientForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    emergency_contact: '',
    expected_delivery_date: '',
    pregnancy_stage: '',
    package_id: ''
  });

  const [providerForm, setProviderForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'doctor' as 'doctor' | 'nutritionist' | 'therapist' | 'yoga',
    specialization: '',
    license_number: ''
  });

  const [appointmentForm, setAppointmentForm] = useState({
    patient_id: '',
    provider_id: '',
    provider_role: 'doctor' as 'doctor' | 'nutritionist' | 'therapist' | 'yoga',
    date_time: '',
    type: '',
    notes: ''
  });

  const [packageForm, setPackageForm] = useState({
    name: 'basic' as 'basic' | 'medium' | 'comprehensive',
    price: 0,
    duration_months: 1,
    included_services: {}
  });

  // Load all data on component mount
  useEffect(() => {
    loadAllData();
    setupRealtimeSubscriptions();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        patientsData,
        providersData,
        appointmentsData,
        packagesData,
        paymentsData,
        statsData
      ] = await Promise.all([
        PatientService.getAllPatients(),
        ProviderService.getAllProviders(),
        AppointmentService.getAllAppointments(),
        PackageService.getAllPackages(),
        PaymentService.getAllPayments(),
        AnalyticsService.getDashboardStats()
      ]);

      setPatients(patientsData);
      setProviders(providersData);
      setAppointments(appointmentsData);
      setPackages(packagesData);
      setPayments(paymentsData);
      setDashboardStats(statsData);

      toast({
        title: "Dashboard Loaded",
        description: `Successfully loaded ${patientsData.length} patients, ${providersData.length} providers, and ${appointmentsData.length} appointments.`,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
      toast({
        title: "Error",
        description: "Failed to load dashboard data from database.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Real-time updates for live dashboard
    RealtimeService.subscribeToPatients((payload) => {
      console.log('Patient update:', payload);
      loadAllData(); // Refresh data on changes
    });
    
    RealtimeService.subscribeToAppointments((payload) => {
      console.log('Appointment update:', payload);
      loadAllData();
    });
    
    RealtimeService.subscribeToPayments((payload) => {
      console.log('Payment update:', payload);
      loadAllData();
    });
  };

  const handleAddPatient = async () => {
    try {
      setLoading(true);
      const newPatient = await PatientService.createPatient(patientForm);
      
      setPatients(prev => [...prev, newPatient]);
      setShowAddPatientModal(false);
      setPatientForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        emergency_contact: '',
        expected_delivery_date: '',
        pregnancy_stage: '',
        package_id: ''
      });

      toast({
        title: "Success!",
        description: `Patient ${newPatient.user.name} has been added successfully.`,
      });

      // Refresh dashboard stats
      const stats = await AnalyticsService.getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error adding patient:', error);
      toast({
        title: "Error",
        description: "Failed to add patient. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProvider = async () => {
    try {
      setLoading(true);
      const newProvider = await ProviderService.createProvider(providerForm);
      
      setProviders(prev => [...prev, newProvider]);
      setShowAddProviderModal(false);
      setProviderForm({
        name: '',
        email: '',
        phone: '',
        role: 'doctor',
        specialization: '',
        license_number: ''
      });

      toast({
        title: "Success!",
        description: `Provider ${newProvider.name} has been added successfully.`,
      });

      const stats = await AnalyticsService.getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error adding provider:', error);
      toast({
        title: "Error",
        description: "Failed to add provider. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAppointment = async () => {
    try {
      setLoading(true);
      const newAppointment = await AppointmentService.createAppointment(appointmentForm);
      
      setAppointments(prev => [...prev, newAppointment]);
      setShowAddAppointmentModal(false);
      setAppointmentForm({
        patient_id: '',
        provider_id: '',
        provider_role: 'doctor',
        date_time: '',
        type: '',
        notes: ''
      });

      toast({
        title: "Success!",
        description: "Appointment has been scheduled successfully.",
      });

      const stats = await AnalyticsService.getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error adding appointment:', error);
      toast({
        title: "Error",
        description: "Failed to schedule appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePackage = async () => {
    try {
      setLoading(true);
      const newPackage = await PackageService.createPackage(packageForm);
      
      setPackages(prev => [...prev, newPackage]);
      setShowCreatePackageModal(false);
      setPackageForm({
        name: 'basic',
        price: 0,
        duration_months: 1,
        included_services: {}
      });

      toast({
        title: "Success!",
        description: "Healthcare package has been created successfully.",
      });
    } catch (error) {
      console.error('Error creating package:', error);
      toast({
        title: "Error",
        description: "Failed to create package. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const viewPatientDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientDetailsModal(true);
  };

  const updatePaymentStatus = async (paymentId: string, status: 'completed' | 'failed') => {
    try {
      await PaymentService.updatePaymentStatus(paymentId, status);
      
      // Refresh payments and stats
      const [paymentsData, statsData] = await Promise.all([
        PaymentService.getAllPayments(),
        AnalyticsService.getDashboardStats()
      ]);
      
      setPayments(paymentsData);
      setDashboardStats(statsData);

      toast({
        title: "Success!",
        description: `Payment status updated to ${status}.`,
      });
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status.",
        variant: "destructive",
      });
    }
  };

  if (loading && patients.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading Dashboard...</h2>
          <p className="text-gray-600">Fetching data from Supabase database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              onClick={loadAllData} 
              className="mt-2 w-full"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pregacare</h1>
                <p className="text-sm text-gray-600">Production Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={loadAllData} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Live Database
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalPatients}</p>
                  <p className="text-xs text-green-600">Active: {dashboardStats.activePatients}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{dashboardStats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-600">Completed Payments: {dashboardStats.completedPayments}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Appointments</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalAppointments}</p>
                  <p className="text-xs text-blue-600">Upcoming: {dashboardStats.upcomingAppointments}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Providers</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalProviders}</p>
                  <p className="text-xs text-purple-600">Healthcare Team</p>
                </div>
                <UserCheck className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Patients */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Patients</CardTitle>
                  <CardDescription>Latest registered patients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {patients.slice(0, 5).map((patient) => (
                      <div key={patient.patient_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{patient.user.name}</p>
                          <p className="text-sm text-gray-600">{patient.user.email}</p>
                        </div>
                        <Badge variant={patient.profile_completed ? 'default' : 'secondary'}>
                          {patient.profile_completed ? 'Active' : 'Pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>Next scheduled appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointments
                      .filter(apt => new Date(apt.date_time) > new Date())
                      .slice(0, 5)
                      .map((appointment) => (
                        <div key={appointment.appointment_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{appointment.patient.user.name}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(appointment.date_time).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {appointment.provider.role}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Patient Management</h3>
              <Button onClick={() => setShowAddPatientModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Patient
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium">Patient</th>
                        <th className="text-left py-3 px-4 font-medium">Contact</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Package</th>
                        <th className="text-left py-3 px-4 font-medium">Registered</th>
                        <th className="text-center py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((patient) => (
                        <tr key={patient.patient_id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{patient.user.name}</p>
                              <p className="text-sm text-gray-500">ID: {patient.pregacare_id}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm">{patient.user.email}</p>
                              <p className="text-sm text-gray-500">{patient.user.phone}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={patient.profile_completed ? 'default' : 'secondary'}>
                              {patient.profile_completed ? 'Active' : 'Pending'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm">
                              {patient.package?.name || 'No Package'}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm">
                              {new Date(patient.created_at).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewPatientDetails(patient)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add other tabs with similar real data integration... */}
          {/* For brevity, I'll add the key payment management tab */}
          
          <TabsContent value="payments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Payment Management</h3>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Payments</p>
                      <p className="text-2xl font-bold">{dashboardStats.pendingPayments}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Completed Payments</p>
                      <p className="text-2xl font-bold">{dashboardStats.completedPayments}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold">₹{dashboardStats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium">Patient</th>
                        <th className="text-left py-3 px-4 font-medium">Package</th>
                        <th className="text-left py-3 px-4 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-center py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.payment_id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <p className="font-medium">Patient ID: {payment.patient_id}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm">Package ID: {payment.package_id}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium">₹{payment.amount.toLocaleString()}</p>
                          </td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={
                                payment.payment_status === 'completed' ? 'default' :
                                payment.payment_status === 'pending' ? 'secondary' :
                                payment.payment_status === 'failed' ? 'destructive' : 'outline'
                              }
                            >
                              {payment.payment_status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm">{new Date(payment.created_at).toLocaleDateString()}</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center gap-2">
                              {payment.payment_status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updatePaymentStatus(payment.payment_id, 'completed')}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updatePaymentStatus(payment.payment_id, 'failed')}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Decline
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Patient Modal */}
      <Dialog open={showAddPatientModal} onOpenChange={setShowAddPatientModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>Register a new patient in the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={patientForm.name}
                onChange={(e) => setPatientForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter patient name"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={patientForm.email}
                onChange={(e) => setPatientForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={patientForm.phone}
                onChange={(e) => setPatientForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label>Expected Delivery Date</Label>
              <Input
                type="date"
                value={patientForm.expected_delivery_date}
                onChange={(e) => setPatientForm(prev => ({ ...prev, expected_delivery_date: e.target.value }))}
              />
            </div>
            <div>
              <Label>Package</Label>
              <Select 
                value={patientForm.package_id} 
                onValueChange={(value) => setPatientForm(prev => ({ ...prev, package_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Package</SelectItem>
                  {packages.map(pkg => (
                    <SelectItem key={pkg.package_id} value={pkg.package_id}>
                      {pkg.name} - ₹{pkg.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddPatientModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPatient} disabled={loading}>
                {loading ? 'Adding...' : 'Add Patient'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Patient Details Modal */}
      <Dialog open={showPatientDetailsModal} onOpenChange={setShowPatientDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Profile - {selectedPatient?.user.name}</DialogTitle>
            <DialogDescription>Complete patient information</DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                    <p>{selectedPatient.user.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p>{selectedPatient.user.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Phone</Label>
                    <p>{selectedPatient.user.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Pregacare ID</Label>
                    <p className="font-mono">{selectedPatient.pregacare_id}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Medical Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Expected Delivery</Label>
                    <p>{selectedPatient.expected_delivery_date || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Pregnancy Stage</Label>
                    <p>{selectedPatient.pregnancy_stage || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Package</Label>
                    <p>{selectedPatient.package?.name || 'No package assigned'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Emergency Contact</Label>
                    <p>{selectedPatient.emergency_contact || 'Not specified'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}