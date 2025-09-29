import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Check, Star, Users, Clock, Heart, Shield, TrendingUp } from 'lucide-react';
import { 
  HEALTHCARE_PACKAGES, 
  PackagePaymentCalculator, 
  PackageSelectionManager,
  type HealthcarePackage 
} from '../lib/packagePricingSystem';

interface PackageSelectionProps {
  patientId: string;
  onPackageSelected: (packages: HealthcarePackage[], totalAmount: number) => void;
}

export default function PackageSelection({ patientId, onPackageSelected }: PackageSelectionProps) {
  const [selectionManager] = useState(() => new PackageSelectionManager(patientId));
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);
  const [calculation, setCalculation] = useState(PackagePaymentCalculator.calculatePackageTotal([]));

  // Update calculation when selection changes
  useEffect(() => {
    const newCalculation = PackagePaymentCalculator.calculatePackageTotal(selectedPackageIds);
    setCalculation(newCalculation);
    onPackageSelected(newCalculation.packages, newCalculation.total);
  }, [selectedPackageIds, onPackageSelected]);

  const handlePackageToggle = (packageId: string) => {
    selectionManager.togglePackage(packageId);
    setSelectedPackageIds(selectionManager.getSelectedPackages());
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPackageIcon = (packageName: string) => {
    switch (packageName) {
      case 'basic': return <Shield className="h-8 w-8 text-blue-500" />;
      case 'medium': return <Heart className="h-8 w-8 text-purple-500" />;
      case 'comprehensive': return <Star className="h-8 w-8 text-gold-500" />;
      default: return <Shield className="h-8 w-8" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Choose Your Healthcare Package
        </h1>
        <p className="text-lg text-gray-600">
          Select the perfect care package for your pregnancy journey
        </p>
      </div>

      {/* Package Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {HEALTHCARE_PACKAGES.map((pkg) => {
          const isSelected = selectedPackageIds.includes(pkg.id);
          
          return (
            <Card 
              key={pkg.id}
              className={`relative transition-all duration-300 cursor-pointer hover:shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-purple-500 shadow-xl transform scale-105' 
                  : 'hover:shadow-md'
              } ${pkg.popular ? 'border-purple-200' : ''}`}
              onClick={() => handlePackageToggle(pkg.id)}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center space-y-4">
                {getPackageIcon(pkg.name)}
                
                <div>
                  <h3 className="text-2xl font-bold">{pkg.displayName}</h3>
                  <p className="text-gray-600 mt-2">{pkg.description}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-purple-600">
                    {formatPrice(pkg.price)}
                  </div>
                  <div className="flex items-center justify-center text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    {pkg.duration} months
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Features List */}
                <div className="space-y-3">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Selection Button */}
                <Button
                  className={`w-full mt-6 ${
                    isSelected
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePackageToggle(pkg.id);
                  }}
                >
                  {isSelected ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Selected
                    </>
                  ) : (
                    'Select Package'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Package Combination Benefits */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-purple-600" />
            Package Combination Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-purple-600">10% OFF</div>
              <div className="text-sm text-gray-600">Select any 2 packages</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-purple-600">15% OFF</div>
              <div className="text-sm text-gray-600">Select all 3 packages</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-purple-600">FREE</div>
              <div className="text-sm text-gray-600">Extra consultations included</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Summary */}
      {selectedPackageIds.length > 0 && (
        <Card className="sticky bottom-0 bg-white shadow-lg border-t-4 border-purple-500">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Order Summary</h3>
              
              {/* Selected Packages */}
              <div className="space-y-2">
                {calculation.breakdown.map((item) => (
                  <div key={item.packageId} className="flex justify-between">
                    <span>{item.name}</span>
                    <span>{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Pricing Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(calculation.subtotal)}</span>
                </div>
                
                {calculation.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Package Discount</span>
                    <span>-{formatPrice(calculation.discount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span>{formatPrice(calculation.gst)}</span>
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total Amount</span>
                <span className="text-purple-600">{formatPrice(calculation.total)}</span>
              </div>

              {/* Package Count Badge */}
              <div className="flex items-center justify-center space-x-2">
                <Badge variant="outline" className="text-purple-600 border-purple-600">
                  <Users className="h-3 w-3 mr-1" />
                  {selectedPackageIds.length} Package{selectedPackageIds.length > 1 ? 's' : ''} Selected
                </Badge>
                {calculation.discount > 0 && (
                  <Badge className="bg-green-100 text-green-800">
                    {Math.round((calculation.discount / calculation.subtotal) * 100)}% Savings
                  </Badge>
                )}
              </div>

              {/* Info Text */}
              <p className="text-sm text-gray-600 text-center">
                All packages include 24/7 support and emergency consultations
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}