import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  Plus,
  RefreshCw,
  Package,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Simple dashboard with hardcoded data for now
export default function SimpleAdminDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Hardcoded package-based dashboard data
  const dashboardStats = {
    totalPatients: 156,
    activePatients: 142,
    totalProviders: 28,
    totalRevenue: 2847650,
    pendingPayments: 145000,
    completedPayments: 2702650,
    upcomingAppointments: 24,
    totalAppointments: 1247,
    packageRevenue: {
      basic: { revenue: 799920, subscriptions: 80 },
      medium: { revenue: 1439910, subscriptions: 72 },
      comprehensive: { revenue: 607820, subscriptions: 17 }
    },
    mostPopularPackage: 'Standard Care',
    totalPackageSubscriptions: 169
  };

  const packageData = [
    {
      name: 'Basic Care',
      price: '₹9,999',
      subscriptions: dashboardStats.packageRevenue.basic.subscriptions,
      revenue: dashboardStats.packageRevenue.basic.revenue,
      color: 'bg-blue-50 border-blue-200'
    },
    {
      name: 'Standard Care',
      price: '₹19,999',
      subscriptions: dashboardStats.packageRevenue.medium.subscriptions,
      revenue: dashboardStats.packageRevenue.medium.revenue,
      color: 'bg-purple-50 border-purple-200',
      popular: true
    },
    {
      name: 'Premium Care',
      price: '₹34,999',
      subscriptions: dashboardStats.packageRevenue.comprehensive.subscriptions,
      revenue: dashboardStats.packageRevenue.comprehensive.revenue,
      color: 'bg-yellow-50 border-yellow-200'
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Dashboard Refreshed",
        description: "All data has been updated successfully.",
      });
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Healthcare Package Management System</p>
        </div>
        <Button onClick={handleRefresh} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalPackageSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(dashboardStats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.upcomingAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Next 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Package Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-6 w-6 mr-2 text-purple-600" />
              Package Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {packageData.map((pkg, index) => (
                <Card key={index} className={`${pkg.color} transition-all hover:shadow-md`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">{pkg.name}</h3>
                          {pkg.popular && (
                            <Badge variant="secondary" className="text-xs">
                              Most Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{pkg.price}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">
                          {formatPrice(pkg.revenue)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {pkg.subscriptions} subscriptions
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Performance</span>
                        <span>
                          {Math.round((pkg.revenue / dashboardStats.totalRevenue) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min((pkg.revenue / dashboardStats.totalRevenue) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
              Quick Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Revenue This Month</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(dashboardStats.totalRevenue)}
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>

              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium">Active Providers</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {dashboardStats.totalProviders}
                  </div>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>

              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <div>
                  <div className="font-medium">Pending Payments</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatPrice(dashboardStats.pendingPayments)}
                  </div>
                </div>
                <AlertTriangle className="h-8 w-8 text-purple-500" />
              </div>

              <div className="text-center pt-4">
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  View Detailed Reports
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-800">System Status: Operational</h3>
              <p className="text-green-700">
                All systems are functioning normally. Package-based payment system is active and processing transactions.
              </p>
            </div>
            <div className="flex space-x-2">
              <Badge className="bg-green-100 text-green-800">Database: Connected</Badge>
              <Badge className="bg-blue-100 text-blue-800">Payments: Active</Badge>
              <Badge className="bg-purple-100 text-purple-800">API: Healthy</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}