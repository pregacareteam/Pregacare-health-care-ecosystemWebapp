import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Star,
  Heart,
  Shield,
  RefreshCw
} from 'lucide-react';
import { 
  HEALTHCARE_PACKAGES,
  PackageRevenueAnalytics,
  PackagePaymentCalculator
} from '../lib/packagePricingSystem';

interface PackageRevenueData {
  packageName: string;
  revenue: number;
  subscriptions: number;
  averageValue: number;
}

export default function PackageRevenueDashboard() {
  const [revenueData, setRevenueData] = useState<PackageRevenueData[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalRevenue: 0,
    totalSubscriptions: 0,
    averagePackageValue: 0,
    mostPopularPackage: 'Standard Care'
  });
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load package revenue data
  const loadPackageData = async () => {
    try {
      setLoading(true);
      
      // Get revenue by package
      const packageRevenue = await PackageRevenueAnalytics.getRevenueByPackage();
      setRevenueData(packageRevenue);

      // Get total stats
      const totalRevenue = await PackageRevenueAnalytics.getTotalPackageRevenue();
      setTotalStats(totalRevenue);

      // Get monthly trends
      const monthlyData = await PackageRevenueAnalytics.getMonthlyPackageRevenue();
      setMonthlyTrends(monthlyData);

    } catch (error) {
      console.error('Error loading package data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackageData();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPackageIcon = (packageName: string) => {
    if (packageName.includes('Basic')) return <Shield className="h-8 w-8 text-blue-500" />;
    if (packageName.includes('Standard')) return <Heart className="h-8 w-8 text-purple-500" />;
    if (packageName.includes('Premium')) return <Star className="h-8 w-8 text-gold-500" />;
    return <Package className="h-8 w-8" />;
  };

  const getPackageColor = (packageName: string) => {
    if (packageName.includes('Basic')) return 'bg-blue-50 border-blue-200';
    if (packageName.includes('Standard')) return 'bg-purple-50 border-purple-200';
    if (packageName.includes('Premium')) return 'bg-yellow-50 border-yellow-200';
    return 'bg-gray-50 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Package Revenue Dashboard</h2>
          <p className="text-gray-600">Track healthcare package subscriptions and revenue</p>
        </div>
        <Button onClick={loadPackageData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(totalStats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              From all package subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalStats.totalSubscriptions}
            </div>
            <p className="text-xs text-muted-foreground">
              Patients with active packages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Package Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatPrice(totalStats.averagePackageValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per subscription
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular Package</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold-600">
              {totalStats.mostPopularPackage}
            </div>
            <p className="text-xs text-muted-foreground">
              Highest subscription count
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Package Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Package Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {HEALTHCARE_PACKAGES.map((pkg, index) => {
                  const revenueInfo = revenueData.find(r => 
                    r.packageName === pkg.displayName
                  ) || { revenue: 0, subscriptions: 0, averageValue: 0 };

                  return (
                    <Card 
                      key={pkg.id} 
                      className={`${getPackageColor(pkg.displayName)} transition-all hover:shadow-md`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {getPackageIcon(pkg.displayName)}
                            <div>
                              <h3 className="font-semibold text-lg">{pkg.displayName}</h3>
                              <p className="text-sm text-gray-600">
                                {formatPrice(pkg.price)} • {pkg.duration} months
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right space-y-1">
                            <div className="text-2xl font-bold text-green-600">
                              {formatPrice(revenueInfo.revenue)}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary">
                                <Users className="h-3 w-3 mr-1" />
                                {revenueInfo.subscriptions} subscriptions
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Progress bar showing package performance */}
                        <div className="mt-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Revenue Performance</span>
                            <span>
                              {totalStats.totalRevenue > 0 
                                ? Math.round((revenueInfo.revenue / totalStats.totalRevenue) * 100)
                                : 0}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${totalStats.totalRevenue > 0 
                                  ? Math.min((revenueInfo.revenue / totalStats.totalRevenue) * 100, 100)
                                  : 0}%` 
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyTrends.slice(-6).map((month, index) => (
                <div key={index} className="border-b pb-3 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{month.month}</div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {formatPrice(month.totalRevenue)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Basic: {formatPrice(month.basicRevenue)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Standard: {formatPrice(month.mediumRevenue)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Premium: {formatPrice(month.comprehensiveRevenue)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Package Pricing Reference */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-6 w-6 mr-2 text-purple-600" />
            Fixed Package Pricing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {HEALTHCARE_PACKAGES.map((pkg) => (
              <div key={pkg.id} className="text-center p-4 bg-white rounded-lg border">
                <div className="font-semibold text-lg">{pkg.displayName}</div>
                <div className="text-2xl font-bold text-purple-600 my-2">
                  {formatPrice(pkg.price)}
                </div>
                <div className="text-sm text-gray-600">
                  {pkg.duration} months • {pkg.features.length} features
                </div>
                <Badge 
                  variant={pkg.popular ? "default" : "secondary"} 
                  className="mt-2"
                >
                  {pkg.popular ? "Popular Choice" : "Available"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}