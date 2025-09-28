import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  Clock, 
  User, 
  Video, 
  Phone, 
  MessageSquare,
  Search,
  Filter,
  Plus,
  CheckCircle,
  XCircle,
  Clock3
} from "lucide-react";
import { Appointment, User as UserType, Patient, Provider } from "@/types/pregacare";
import { pregacareDB } from "@/lib/storage";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";

interface AppointmentSectionProps {
  user: UserType;
}

export const AppointmentSection = ({ user }: AppointmentSectionProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewAppointment, setShowNewAppointment] = useState(false);

  useEffect(() => {
    loadAppointments();
    loadPatientsAndProviders();
  }, [user]);

  const loadAppointments = () => {
    setLoading(true);
    try {
      const allAppointments = pregacareDB.appointments.getAll();
      
      // Filter appointments based on user role
      let userAppointments: Appointment[] = [];
      
      if (user.role === 'patient') {
        userAppointments = allAppointments.filter(apt => apt.patientId === user.id);
      } else {
        // For providers, show appointments where they are the provider
        userAppointments = allAppointments.filter(apt => apt.providerId === user.id);
      }
      
      // Sort by date (most recent first)
      userAppointments.sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
      
      setAppointments(userAppointments);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientsAndProviders = () => {
    try {
      const allPatients = pregacareDB.patients.getAll();
      const allProviders = pregacareDB.providers.getAll();
      setPatients(allPatients);
      setProviders(allProviders);
    } catch (error) {
      console.error('Failed to load patients/providers:', error);
    }
  };

  const getFilteredAppointments = () => {
    let filtered = appointments;

    // Apply status filter
    switch (filter) {
      case 'today':
        filtered = filtered.filter(apt => isToday(new Date(apt.appointmentDate)));
        break;
      case 'upcoming':
        filtered = filtered.filter(apt => 
          new Date(apt.appointmentDate) > new Date() && apt.status !== 'completed'
        );
        break;
      case 'completed':
        filtered = filtered.filter(apt => apt.status === 'completed');
        break;
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(apt => {
        const patient = patients.find(p => p.id === apt.patientId);
        const provider = providers.find(p => p.id === apt.providerId);
        
        return (
          apt.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          provider?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    return filtered;
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || 'Unknown Patient';
  };

  const getProviderName = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    return provider?.name || 'Unknown Provider';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock3 className="w-4 h-4" />;
    }
  };

  const getDateLabel = (appointmentDate: string) => {
    const date = new Date(appointmentDate);
    
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isThisWeek(date)) return format(date, 'EEEE');
    return format(date, 'MMM dd, yyyy');
  };

  const filteredAppointments = getFilteredAppointments();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Appointments</h2>
          <p className="text-gray-600">Manage your scheduled appointments</p>
        </div>
        {user.role !== 'patient' && (
          <Button onClick={() => setShowNewAppointment(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'today', 'upcoming', 'completed'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f as any)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No appointments found
              </h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? "You don't have any appointments yet." 
                  : `No ${filter} appointments found.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{appointment.title}</h3>
                      <Badge className={`${getStatusColor(appointment.status)} flex items-center gap-1`}>
                        {getStatusIcon(appointment.status)}
                        {appointment.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{getDateLabel(appointment.appointmentDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{format(new Date(appointment.appointmentDate), 'h:mm a')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>
                          {user.role === 'patient' 
                            ? `Dr. ${getProviderName(appointment.providerId)}`
                            : getPatientName(appointment.patientId)
                          }
                        </span>
                      </div>
                      {appointment.type === 'video_call' && (
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          <span>Video Consultation</span>
                        </div>
                      )}
                    </div>

                    {appointment.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{appointment.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {appointment.type === 'video_call' && appointment.status === 'scheduled' && (
                      <Button size="sm" variant="outline">
                        <Video className="w-4 h-4 mr-2" />
                        Join Call
                      </Button>
                    )}
                    {appointment.status === 'scheduled' && (
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* New Appointment Modal Placeholder */}
      {showNewAppointment && (
        <Card className="fixed inset-4 z-50 bg-white shadow-2xl">
          <CardHeader>
            <CardTitle>Schedule New Appointment</CardTitle>
            <CardDescription>Book an appointment with a patient</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Appointment scheduling form coming soon...</p>
              <Button 
                className="mt-4" 
                onClick={() => setShowNewAppointment(false)}
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};