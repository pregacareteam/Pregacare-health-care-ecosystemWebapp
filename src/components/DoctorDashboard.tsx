import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Calendar,
  Users,
  FileText,
  MessageSquare,
  Bell,
  Search,
  Plus,
  Video,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Activity,
  Heart,
  Stethoscope,
  Pill,
  TestTube,
  FileImage,
  Send
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Patient {
  id: string;
  patient_id: string;
  name: string;
  pregnancy_week: number;
  risk_status: 'normal' | 'medium' | 'high' | 'critical';
  due_date: string;
  pregnancy_stage: string;
  last_appointment?: string;
}

interface Appointment {
  id: string;
  appointment_id: string;
  patient_name: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: 'video' | 'in_person' | 'phone' | 'home_visit';
  status: string;
  duration_minutes: number;
}

interface MedicalRecord {
  id: string;
  record_id: string;
  patient_name: string;
  patient_id: string;
  record_type: string;
  title: string;
  test_date: string;
  is_critical: boolean;
  status: string;
}

interface DashboardStats {
  total_patients: number;
  upcoming_appointments: number;
  pending_reports: number;
  urgent_alerts: number;
}

const DoctorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);

  // Mock data - will be replaced with real Supabase queries
  const [dashboardStats] = useState<DashboardStats>({
    total_patients: 24,
    upcoming_appointments: 8,
    pending_reports: 5,
    urgent_alerts: 2
  });

  const [patients] = useState<Patient[]>([
    {
      id: '1',
      patient_id: 'P001',
      name: 'Ananya Reddy',
      pregnancy_week: 24,
      risk_status: 'normal',
      due_date: '2025-12-25',
      pregnancy_stage: 'second_trimester',
      last_appointment: '2025-09-15'
    },
    {
      id: '2',
      patient_id: 'P002',
      name: 'Priyanka Singh',
      pregnancy_week: 34,
      risk_status: 'medium',
      due_date: '2025-11-15',
      pregnancy_stage: 'third_trimester',
      last_appointment: '2025-09-20'
    },
    {
      id: '3',
      patient_id: 'P003',
      name: 'Sneha Gupta',
      pregnancy_week: 8,
      risk_status: 'normal',
      due_date: '2026-06-10',
      pregnancy_stage: 'first_trimester',
      last_appointment: '2025-09-10'
    }
  ]);

  const [upcomingAppointments] = useState<Appointment[]>([
    {
      id: '1',
      appointment_id: 'APT001',
      patient_name: 'Ananya Reddy',
      patient_id: 'P001',
      appointment_date: '2025-10-05',
      appointment_time: '10:00:00',
      appointment_type: 'video',
      status: 'scheduled',
      duration_minutes: 30
    },
    {
      id: '2',
      appointment_id: 'APT002',
      patient_name: 'Priyanka Singh',
      patient_id: 'P002',
      appointment_date: '2025-10-03',
      appointment_time: '14:30:00',
      appointment_type: 'in_person',
      status: 'confirmed',
      duration_minutes: 45
    }
  ]);

  const [recentReports] = useState<MedicalRecord[]>([
    {
      id: '1',
      record_id: 'MR001',
      patient_name: 'Ananya Reddy',
      patient_id: 'P001',
      record_type: 'lab_report',
      title: 'Complete Blood Count',
      test_date: '2025-09-25',
      is_critical: false,
      status: 'pending'
    },
    {
      id: '2',
      record_id: 'MR002',
      patient_name: 'Priyanka Singh',
      patient_id: 'P002',
      record_type: 'lab_report',
      title: 'Glucose Tolerance Test',
      test_date: '2025-09-20',
      is_critical: true,
      status: 'completed'
    }
  ]);

  const getRiskStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'in_person': return <MapPin className="h-4 w-4" />;
      case 'home_visit': return <User className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientDetails(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
                <p className="text-sm text-gray-600">Dr. Priya Sharma - Obstetrician & Gynecologist</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-red-500">
                {dashboardStats.urgent_alerts}
              </Badge>
            </Button>
            <Button variant="ghost" size="sm">
              <MessageSquare className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Assigned Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.total_patients}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.upcoming_appointments}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.pending_reports}</p>
                </div>
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Urgent Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.urgent_alerts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Appointments */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold">Today's Appointments</CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Appointment
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingAppointments.slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50">
                        <div className="flex items-center space-x-3">
                          {getAppointmentTypeIcon(appointment.appointment_type)}
                          <div>
                            <p className="font-medium text-sm">{appointment.patient_name}</p>
                            <p className="text-xs text-gray-600">{appointment.patient_id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{appointment.appointment_time}</p>
                          <Badge variant="outline" className="text-xs">
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Lab Reports */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold">Recent Lab Reports</CardTitle>
                  <Button size="sm" variant="outline">View All</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50">
                        <div className="flex items-center space-x-3">
                          {report.record_type === 'lab_report' ? (
                            <TestTube className="h-5 w-5 text-blue-600" />
                          ) : (
                            <FileImage className="h-5 w-5 text-purple-600" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{report.title}</p>
                            <p className="text-xs text-gray-600">{report.patient_name} • {report.test_date}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {report.is_critical && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          <Badge 
                            variant="outline" 
                            className={report.status === 'completed' ? 'border-green-200 text-green-700' : 'border-yellow-200 text-yellow-700'}
                          >
                            {report.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* High Risk Patients Alert */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-red-800 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  High Risk Patients Requiring Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patients.filter(p => p.risk_status === 'medium' || p.risk_status === 'high' || p.risk_status === 'critical').map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-3 rounded-lg border-l-4 border-red-500 bg-red-50">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium text-sm">{patient.name} ({patient.patient_id})</p>
                          <p className="text-xs text-gray-600">Week {patient.pregnancy_week} • Due: {patient.due_date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getRiskStatusColor(patient.risk_status)}>
                          {patient.risk_status.toUpperCase()}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xl font-semibold">Patient Management</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Patient
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPatients.map((patient) => (
                    <div 
                      key={patient.id} 
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{patient.name}</h3>
                          <p className="text-sm text-gray-600">ID: {patient.patient_id}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">Week {patient.pregnancy_week}</p>
                          <p className="text-xs text-gray-600">{patient.pregnancy_stage.replace('_', ' ')}</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">{patient.due_date}</p>
                          <p className="text-xs text-gray-600">Due Date</p>
                        </div>
                        
                        <Badge className={getRiskStatusColor(patient.risk_status)}>
                          {patient.risk_status.toUpperCase()}
                        </Badge>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Calendar className="h-4 w-4 mr-1" />
                            Schedule
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xl font-semibold">Appointment Management</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule New Appointment
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          {getAppointmentTypeIcon(appointment.appointment_type)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{appointment.patient_name}</h3>
                          <p className="text-sm text-gray-600">{appointment.patient_id} • {appointment.appointment_id}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">{appointment.appointment_date}</p>
                          <p className="text-xs text-gray-600">{appointment.appointment_time}</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">{appointment.duration_minutes} min</p>
                          <p className="text-xs text-gray-600">{appointment.appointment_type.replace('_', ' ')}</p>
                        </div>
                        
                        <Badge 
                          variant="outline" 
                          className={appointment.status === 'confirmed' ? 'border-green-200 text-green-700' : 'border-blue-200 text-blue-700'}
                        >
                          {appointment.status}
                        </Badge>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Join</Button>
                          <Button size="sm" variant="outline">Reschedule</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xl font-semibold">Medical Reports & Records</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Request Test
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                          {report.record_type === 'lab_report' ? (
                            <TestTube className="h-6 w-6 text-purple-600" />
                          ) : (
                            <FileImage className="h-6 w-6 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{report.title}</h3>
                          <p className="text-sm text-gray-600">{report.patient_name} • {report.record_id}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">{report.test_date}</p>
                          <p className="text-xs text-gray-600">Test Date</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {report.is_critical && (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                          )}
                          <Badge 
                            variant="outline" 
                            className={report.status === 'completed' ? 'border-green-200 text-green-700' : 'border-yellow-200 text-yellow-700'}
                          >
                            {report.status}
                          </Badge>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">View</Button>
                          <Button size="sm" variant="outline">
                            <Send className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Patient Communications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Communication Center</h3>
                  <p className="text-gray-600 mb-4">Chat with patients, send updates, and manage communications</p>
                  <Button>Start New Conversation</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorDashboard;