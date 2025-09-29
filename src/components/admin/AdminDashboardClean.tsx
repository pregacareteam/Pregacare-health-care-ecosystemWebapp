import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Activity
} from 'lucide-react';
import { Input } from '@/components/ui/input';

// Main Admin Dashboard Component
export function AdminDashboardClean() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // KPI Data Structure (empty for clean start)
  const kpiData = {
    activePatients: 0,
    activeProviders: 0,
    appointmentsToday: 0,
    revenueThisMonth: 0,
    pendingIssues: 0
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="overview">
                <OverviewDashboard kpiData={kpiData} />
              </TabsContent>
              
              <TabsContent value="patients">
                <PatientsManagement />
              </TabsContent>
              
              <TabsContent value="providers">
                <ProvidersManagement />
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
                <AnalyticsInsights />
              </TabsContent>
              
              <TabsContent value="settings">
                <SystemSettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
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
function OverviewDashboard({ kpiData }: { kpiData: any }) {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KPICard
          title="Active Patients"
          value={kpiData.activePatients}
          icon={Users}
          color="blue"
          onClick={() => console.log('Navigate to patients')}
        />
        <KPICard
          title="Active Providers"
          value={kpiData.activeProviders}
          icon={UserCheck}
          color="green"
          onClick={() => console.log('Navigate to providers')}
        />
        <KPICard
          title="Appointments Today"
          value={kpiData.appointmentsToday}
          icon={Calendar}
          color="orange"
          onClick={() => console.log('Navigate to calendar')}
        />
        <KPICard
          title="Revenue This Month"
          value={`₹${kpiData.revenueThisMonth.toLocaleString()}`}
          icon={DollarSign}
          color="purple"
          onClick={() => console.log('Navigate to payments')}
        />
        <KPICard
          title="Pending Issues"
          value={kpiData.pendingIssues}
          icon={AlertTriangle}
          color="red"
          onClick={() => console.log('Navigate to support')}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button className="h-16 flex flex-col gap-2">
          <Plus className="w-5 h-5" />
          Add New Patient
        </Button>
        <Button variant="outline" className="h-16 flex flex-col gap-2">
          <Plus className="w-5 h-5" />
          Add New Provider
        </Button>
        <Button variant="outline" className="h-16 flex flex-col gap-2">
          <Users className="w-5 h-5" />
          View All Patients
        </Button>
        <Button variant="outline" className="h-16 flex flex-col gap-2">
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
function PatientsManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Patients Management</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search by Patient Name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Patients Table */}
      <Card>
        <CardContent className="p-0">
          <div className="text-center py-12 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Patients Yet</h3>
            <p className="mb-4">Start by adding your first patient to the system</p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add First Patient
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 3. Providers Management Component
function ProvidersManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Providers Management</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Provider
        </Button>
      </div>

      {/* Provider Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <CardContent className="p-0">
            <Stethoscope className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold">Doctors</h3>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card className="text-center p-4">
          <CardContent className="p-0">
            <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold">Nutritionists</h3>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card className="text-center p-4">
          <CardContent className="p-0">
            <Activity className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-semibold">Yoga Trainers</h3>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card className="text-center p-4">
          <CardContent className="p-0">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <h3 className="font-semibold">Therapists</h3>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>

      {/* Providers List */}
      <Card>
        <CardContent className="p-0">
          <div className="text-center py-12 text-gray-500">
            <UserCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Providers Yet</h3>
            <p className="mb-4">Add healthcare providers to start building your network</p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add First Provider
            </Button>
          </div>
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
function AnalyticsInsights() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics & Insights</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Analytics will appear as data grows</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Business Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Revenue trends will show here</p>
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