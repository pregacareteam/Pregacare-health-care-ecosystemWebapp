import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { PatientCard } from "@/components/PatientCard";
import { PregacareBranding } from "@/components/PregacareBranding";
import { PatientDetailsModal } from "@/components/PatientDetailsModal";
import { PrescriptionModal } from "@/components/PrescriptionModal";
import { ReferralModal } from "@/components/ReferralModal";
import { PatientRegistrationModal } from "@/components/PatientRegistrationModal";
import { AppointmentBookingModal } from "@/components/AppointmentBookingModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { User } from "@/types/roles";
import { useDoctorData, Patient } from "@/hooks/useDoctorData";
import { 
  Users, 
  Calendar, 
  FileText, 
  Video, 
  Clock,
  TrendingUp,
  MessageSquare,
  Search,
  Filter,
  AlertTriangle,
  Plus
} from "lucide-react";

interface DoctorDashboardProps {
  user: User;
  onLogout: () => void;
}

export function DoctorDashboard({ user, onLogout }: DoctorDashboardProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showPatientRegistration, setShowPatientRegistration] = useState(false);
  const [showAppointmentBooking, setShowAppointmentBooking] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState<string>("all");

  // Use mock doctor ID for now - in production this would come from auth
  const doctorId = user.id || "mock-doctor-id";
  const { patients, appointments, loading, createPrescription, createReferral, updateAppointmentStatus, refetch } = useDoctorData(doctorId);

  // Calculate stats
  const totalPatients = patients.length;
  const todaysAppointments = appointments.filter(apt => {
    const today = new Date().toDateString();
    return new Date(apt.appointment_date).toDateString() === today;
  }).length;
  
  const thisMonthConsultations = appointments.filter(apt => {
    const thisMonth = new Date();
    const aptDate = new Date(apt.appointment_date);
    return aptDate.getMonth() === thisMonth.getMonth() && 
           aptDate.getFullYear() === thisMonth.getFullYear();
  }).length;

  const highRiskPatients = patients.filter(p => p.risk_status === 'high').length;

  // Filter patients
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === "all" || patient.risk_status === filterRisk;
    return matchesSearch && matchesRisk;
  });

  // Get today's appointments with patient details
  const todaysAppointmentsList = appointments
    .filter(apt => {
      const today = new Date().toDateString();
      return new Date(apt.appointment_date).toDateString() === today;
    })
    .slice(0, 5);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientDetails(true);
  };

  const handleStartConsultation = (patient: Patient) => {
    // Start video consultation
    alert(`Starting video consultation with ${patient.name}. In a real app, this would launch a video call.`);
  };

  const handleScheduleAppointment = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowAppointmentBooking(true);
  };

  const handleCreatePrescription = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPrescriptionModal(true);
  };

  const handleReferPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowReferralModal(true);
  };

  return (
    <DashboardLayout
      title="Doctor Dashboard"
      user={user}
      onLogout={onLogout}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Patients"
          value={totalPatients}
          subtitle="Active patients"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Today's Appointments"
          value={todaysAppointments}
          subtitle="Scheduled for today"
          icon={Calendar}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Consultations This Month"
          value={thisMonthConsultations}
          subtitle="Video + In-person"
          icon={Video}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="High Risk Patients"
          value={highRiskPatients}
          subtitle="Require monitoring"
          icon={AlertTriangle}
          trend={{ value: 2, isPositive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Appointments */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Today's Appointments
            </CardTitle>
            <CardDescription>Scheduled consultations for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysAppointmentsList.length > 0 ? (
                todaysAppointmentsList.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gradient-card rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground text-sm font-medium">
                          {appointment.patients?.name.split(' ').map(n => n[0]).join('') || 'UN'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{appointment.patients?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(appointment.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {appointment.type}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="text-xs"
                      onClick={() => alert(`Joining consultation with ${appointment.patients?.name || 'patient'}. In a real app, this would start the video call.`)}
                    >
                      <Video className="w-3 h-3 mr-1" />
                      Join
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No appointments today</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Patient Management */}
        <Card className="shadow-soft lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Pregacare Patient Management
                </CardTitle>
                <CardDescription>Manage your Pregacare ecosystem patients</CardDescription>
              </div>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setShowPatientRegistration(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Pregacare Patient
              </Button>
            </div>
            
            {/* Search and Filters */}
            <div className="flex gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Risk Levels</option>
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading patients...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <PatientCard
                      key={patient.id}
                      patient={patient}
                      onViewDetails={handlePatientSelect}
                      onStartConsultation={handleStartConsultation}
                      onScheduleAppointment={handleScheduleAppointment}
                    />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    {searchTerm || filterRisk !== "all" 
                      ? "No Pregacare patients match your filters" 
                      : "No Pregacare patients found. Use 'Add Pregacare Patient' to add patients from the ecosystem."
                    }
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Button 
            variant="hero" 
            className="h-20 flex-col gap-2"
            onClick={() => {
              const availablePatients = patients.filter(p => p.id);
              if (availablePatients.length > 0) {
                setSelectedPatient(availablePatients[0]);
                handleStartConsultation(availablePatients[0]);
              } else {
                alert('No patients available for consultation. Please add Pregacare patients first.');
              }
            }}
          >
            <Video className="w-6 h-6" />
            Start Consultation
          </Button>
          <Button 
            variant="wellness" 
            className="h-20 flex-col gap-2"
            onClick={() => {
              const recordsCount = appointments.filter(apt => apt.status === 'completed').length;
              alert(`You have ${recordsCount} completed consultations. In a real app, this would show detailed medical records with documents, images, and notes.`);
            }}
          >
            <FileText className="w-6 h-6" />
            Medical Records
          </Button>
          <Button 
            variant="accent" 
            className="h-20 flex-col gap-2"
            onClick={() => alert(`You have ${patients.length} active Pregacare patients. In a real app, this would show a comprehensive messaging interface with chat history, notifications, and quick responses.`)}
          >
            <MessageSquare className="w-6 h-6" />
            Patient Messages
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => {
              const thisMonthAppointments = appointments.filter(apt => {
                const thisMonth = new Date();
                const aptDate = new Date(apt.appointment_date);
                return aptDate.getMonth() === thisMonth.getMonth() && 
                       aptDate.getFullYear() === thisMonth.getFullYear();
              }).length;
              alert(`Analytics Overview:\n• Total Patients: ${patients.length}\n• This Month's Appointments: ${thisMonthAppointments}\n• High Risk Patients: ${highRiskPatients}\n• Patient Satisfaction: 98%\n\nIn a real app, this would show detailed analytics with charts, trends, and insights.`);
            }}
          >
            <TrendingUp className="w-6 h-6" />
            Analytics
          </Button>
          <Button 
            variant="secondary" 
            className="h-20 flex-col gap-2"
            onClick={() => setShowPatientRegistration(true)}
          >
            <Plus className="w-6 h-6" />
            Add Pregacare Patient
          </Button>
        </div>
      </div>

      {/* Modals */}
      <PatientDetailsModal
        patient={selectedPatient}
        isOpen={showPatientDetails}
        onClose={() => setShowPatientDetails(false)}
        onCreatePrescription={handleCreatePrescription}
        onReferPatient={handleReferPatient}
      />

      <PrescriptionModal
        patient={selectedPatient}
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        onSave={createPrescription}
      />

      <ReferralModal
        patient={selectedPatient}
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
        onSave={createReferral}
      />

      <PatientRegistrationModal
        isOpen={showPatientRegistration}
        onClose={() => setShowPatientRegistration(false)}
        doctorId={doctorId}
        onPatientAdded={refetch}
      />

      <AppointmentBookingModal
        isOpen={showAppointmentBooking}
        onClose={() => setShowAppointmentBooking(false)}
        patientId={selectedPatient?.id || ""}
        providerId={doctorId}
        onAppointmentBooked={refetch}
      />

      {/* Pregacare Ecosystem Footer */}
      <PregacareBranding variant="footer" />
    </DashboardLayout>
  );
}