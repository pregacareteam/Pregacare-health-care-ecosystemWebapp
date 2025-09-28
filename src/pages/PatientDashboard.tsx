import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { User } from '@/types/roles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { AppointmentBookingModal } from '@/components/AppointmentBookingModal';
import { 
  Calendar, 
  User as UserIcon, 
  Heart, 
  Activity, 
  Pill, 
  FileText, 
  Plus,
  Clock,
  MapPin,
  Phone,
  Video,
  MessageCircle,
  Utensils,
  Dumbbell,
  Brain,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Package,
  Truck,
  MoreHorizontal
} from 'lucide-react';
import { usePatientData } from '@/hooks/usePatientData';
import { format } from 'date-fns';
import { PregacareBranding } from '@/components/PregacareBranding';

interface PatientDashboardProps {
  user: User;
  onLogout: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ user, onLogout }) => {
  const { 
    patientProfile,
    appointments, 
    prescriptions, 
    medicalRecords,
    dietPlans,
    foodOrders,
    therapySessions,
    yogaSessions,
    payments,
    loading,
    refetch
  } = usePatientData(user.id);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showAppointmentBooking, setShowAppointmentBooking] = useState(false);

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.date_time) > new Date() && apt.status === 'scheduled'
  );

  const recentOrders = foodOrders.filter(order => 
    order.delivery_status === 'pending' || order.delivery_status === 'delivered'
  ).slice(0, 5);

  const getProviderTypeColor = (type: string) => {
    switch (type) {
      case 'doctor': return 'bg-blue-500';
      case 'nutritionist': return 'bg-green-500';
      case 'yoga': return 'bg-purple-500';
      case 'therapist': return 'bg-orange-500';
      case 'food_partner': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': 
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'scheduled': 
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={user} onLogout={onLogout} title="Patient Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your health dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} onLogout={onLogout} title="Pregacare Patient Dashboard">
      <div className="space-y-6">
        {/* Pregacare Branding */}
        <div className="mb-4">
          <PregacareBranding variant="header" />
          <p className="text-sm text-muted-foreground mt-2">
            Your exclusive access to the Pregacare healthcare ecosystem
          </p>
        </div>
        {/* Header Section with Greeting */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Welcome back, {user.name}! 👋
              </h2>
              <p className="text-muted-foreground">
                {patientProfile?.pregnancy_stage ? 
                  `Currently in ${patientProfile.pregnancy_stage} stage` : 
                  'Track your pregnancy journey and manage your healthcare'
                }
              </p>
              {patientProfile?.expected_delivery_date && (
                <p className="text-sm text-blue-600 font-medium">
                  Expected delivery: {format(new Date(patientProfile.expected_delivery_date), 'MMMM dd, yyyy')}
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setShowAppointmentBooking(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
              <Button 
                variant="outline"
                onClick={() => alert('Joining video call. In a real app, this would start the video consultation.')}
              >
                <Video className="mr-2 h-4 w-4" />
                Join Video Call
              </Button>
            </div>
          </div>
        </div>

        {/* Package Information */}
        {patientProfile?.packages && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Your Package Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold capitalize">{patientProfile.packages.name} Package</h3>
                  <p className="text-sm text-muted-foreground">
                    ${patientProfile.packages.price} • {patientProfile.packages.duration_months} months
                  </p>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Included Services:</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(patientProfile.packages.included_services || {}).map(([service, value]) => (
                    <Badge key={service} variant="secondary" className="text-xs">
                      {service.replace(/_/g, ' ')}: {value.toString()}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
              <p className="text-xs text-muted-foreground">
                Next: {upcomingAppointments[0] ? 
                  format(new Date(upcomingAppointments[0].date_time), 'MMM dd') : 
                  'None scheduled'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{prescriptions.length}</div>
              <p className="text-xs text-muted-foreground">Current medications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Food Orders</CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentOrders.length}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Status</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge className="bg-green-100 text-green-800">Normal</Badge>
              <p className="text-xs text-muted-foreground mt-1">Current assessment</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => alert('Joining video call. In a real app, this would start the video consultation.')}
              >
                <Video className="h-6 w-6 mb-2" />
                Join Video Call
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => alert('Opening doctor chat. In a real app, this would show the messaging interface.')}
              >
                <MessageCircle className="h-6 w-6 mb-2" />
                Chat with Doctor
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => alert('Ordering food. In a real app, this would open the meal ordering system.')}
              >
                <Utensils className="h-6 w-6 mb-2" />
                Order Food
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => alert('Viewing medical records. In a real app, this would show all your health records.')}
              >
                <FileText className="h-6 w-6 mb-2" />
                View Records
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Upcoming Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Upcoming Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingAppointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.appointment_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getProviderTypeColor(appointment.provider_role)}`} />
                        <div>
                          <p className="font-medium">{appointment.users?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(appointment.date_time), 'MMM dd, yyyy • h:mm a')}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => alert('Joining video call. In a real app, this would start the video consultation.')}
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {upcomingAppointments.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No upcoming appointments</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Food Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="mr-2 h-5 w-5" />
                    Food Delivery Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.order_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getDeliveryIcon(order.delivery_status)}
                        <div>
                          <p className="font-medium capitalize">{order.meal_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(order.timestamp), 'MMM dd, h:mm a')}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(order.delivery_status)}>
                        {order.delivery_status}
                      </Badge>
                    </div>
                  ))}
                  {recentOrders.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No recent orders</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Health Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Health & Pregnancy Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medicalRecords.slice(0, 5).map((record) => (
                    <div key={record.record_id} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{record.record_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(record.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>All Appointments</CardTitle>
                  <CardDescription>Manage your consultations with healthcare providers</CardDescription>
                </div>
                <Button onClick={() => setShowAppointmentBooking(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Book New
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.appointment_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {appointment.users?.name?.charAt(0) || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="font-medium">{appointment.users?.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">{appointment.provider_role}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {format(new Date(appointment.date_time), 'MMM dd, yyyy')}
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {format(new Date(appointment.date_time), 'h:mm a')}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                        <div className="flex space-x-2">
                          {appointment.type === 'video' && (
                            <Button size="sm" variant="outline">
                              <Video className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Diet Plans */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Utensils className="mr-2 h-5 w-5" />
                    Personalized Diet Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dietPlans.length > 0 ? (
                    <div className="space-y-4">
                      {dietPlans[0]?.meal_schedule && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Today's Meals</h4>
                          {Object.entries(dietPlans[0].meal_schedule).map(([meal, details]) => (
                            <div key={meal} className="p-3 bg-gray-50 rounded-lg">
                              <p className="font-medium capitalize">{meal}</p>
                              <p className="text-sm text-muted-foreground">{details as string}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {dietPlans[0]?.notes && (
                        <div>
                          <h4 className="font-medium">Nutritionist Notes</h4>
                          <p className="text-sm text-muted-foreground mt-1">{dietPlans[0].notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No diet plan assigned yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Food Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="mr-2 h-5 w-5" />
                    Food Delivery Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {foodOrders.slice(0, 5).map((order) => (
                      <div key={order.order_id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getDeliveryIcon(order.delivery_status)}
                          <div>
                            <p className="font-medium capitalize">{order.meal_type}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(order.timestamp), 'MMM dd, h:mm a')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.delivery_status)}>
                            {order.delivery_status}
                          </Badge>
                          <Button size="sm" variant="outline" className="ml-2">Track</Button>
                        </div>
                      </div>
                    ))}
                    <Button className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Order Food
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Yoga Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Dumbbell className="mr-2 h-5 w-5" />
                    Yoga Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {yogaSessions.slice(0, 3).map((session) => (
                      <div key={session.session_id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{session.session_type || 'Yoga Session'}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(session.session_date), 'MMM dd, h:mm a')}
                          </p>
                          <p className="text-xs text-muted-foreground">{session.mode}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          {session.mode === 'video' ? <Video className="h-4 w-4" /> : 'View'}
                        </Button>
                      </div>
                    ))}
                    <Button className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Book Yoga Session
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Therapy Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="mr-2 h-5 w-5" />
                    Therapy Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {therapySessions.slice(0, 3).map((session) => (
                      <div key={session.session_id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{session.session_type || 'Therapy Session'}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(session.session_date), 'MMM dd, h:mm a')}
                          </p>
                          <p className="text-xs text-muted-foreground">{session.mode}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          {session.mode === 'video' ? <Video className="h-4 w-4" /> : 'View'}
                        </Button>
                      </div>
                    ))}
                    <Button className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Book Therapy Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Medical Records Tab */}
          <TabsContent value="records" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Medical Records</CardTitle>
                  <CardDescription>Your medical documents and reports</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Record
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medicalRecords.map((record) => (
                    <div key={record.record_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">{record.record_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(record.date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Download</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Prescriptions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Pill className="mr-2 h-5 w-5" />
                  Active Prescriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <div key={prescription.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h4 className="font-medium">{prescription.medication_name}</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Dosage:</span> {prescription.dosage}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Frequency:</span> {prescription.frequency}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Duration:</span> {prescription.duration}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Prescribed:</span> {format(new Date(prescription.prescribed_date), 'MMM dd, yyyy')}
                            </div>
                          </div>
                          {prescription.instructions && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <span className="font-medium">Instructions:</span> {prescription.instructions}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.payment_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CreditCard className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">{payment.packages?.name} Package</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(payment.timestamp), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {payment.payment_method || 'Card'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${payment.amount}</p>
                        <Badge className={getStatusColor(payment.payment_status)}>
                          {payment.payment_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Emergency & Support */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center text-red-700">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Emergency & Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="destructive" className="h-16">
                    <Phone className="mr-2 h-5 w-5" />
                    Emergency Call
                  </Button>
                  <Button variant="outline" className="h-16">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    24/7 Support Chat
                  </Button>
                  <Button variant="outline" className="h-16">
                    <FileText className="mr-2 h-5 w-5" />
                    Help Center
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Appointment Booking Modal */}
      <AppointmentBookingModal
        isOpen={showAppointmentBooking}
        onClose={() => setShowAppointmentBooking(false)}
        patientId={user.id}
        onAppointmentBooked={refetch}
      />
    </DashboardLayout>
  );
};