import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Package,
  Check,
  Star,
  Heart,
  Shield,
  ArrowRight
} from 'lucide-react';
import { 
  HEALTHCARE_PACKAGES,
  PackagePaymentCalculator,
  PackageSelectionManager,
  type HealthcarePackage 
} from '../lib/packagePricingSystem';
import PackagePaymentModal from './PackagePaymentModal';

interface PatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientCreated: (patientId: string, selectedPackages: HealthcarePackage[]) => void;
}

interface PatientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  emergency_contact: string;
  expected_delivery_date: string;
  pregnancy_stage: 'first_trimester' | 'second_trimester' | 'third_trimester';
}

export default function PatientRegistrationModal({
  isOpen,
  onClose,
  onPatientCreated
}: PatientRegistrationModalProps) {
  const [step, setStep] = useState<'form' | 'packages' | 'payment'>('form');
  const [loading, setLoading] = useState(false);
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);
  const [calculation, setCalculation] = useState(PackagePaymentCalculator.calculatePackageTotal([]));
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdPatientId, setCreatedPatientId] = useState<string>('');

  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    emergency_contact: '',
    expected_delivery_date: '',
    pregnancy_stage: 'second_trimester'
  });

  const [selectionManager] = useState(() => new PackageSelectionManager('temp'));

  // Update calculation when selection changes
  useEffect(() => {
    const newCalculation = PackagePaymentCalculator.calculatePackageTotal(selectedPackageIds);
    setCalculation(newCalculation);
  }, [selectedPackageIds]);

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePackageToggle = (packageId: string) => {
    selectionManager.togglePackage(packageId);
    setSelectedPackageIds(selectionManager.getSelectedPackages());
  };

  const isFormValid = () => {
    return formData.name && formData.email && formData.phone && 
           formData.expected_delivery_date && formData.pregnancy_stage;
  };

  const handleFormSubmit = async () => {
    if (!isFormValid()) {
      alert('Please fill in all required fields');
      return;
    }

    setStep('packages');
  };

  const handlePackageSelection = async () => {
    if (selectedPackageIds.length === 0) {
      alert('Please select at least one package');
      return;
    }

    setLoading(true);
    try {
      // Create patient in database (simulation for now)
      const patientId = `patient_${Date.now()}`;
      setCreatedPatientId(patientId);
      
      // Proceed to payment
      setStep('payment');
      setShowPaymentModal(true);
      
    } catch (error) {
      console.error('Error creating patient:', error);
      alert('Failed to create patient profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = (paymentId: string) => {
    const selectedPackages = calculation.packages;
    onPatientCreated(createdPatientId, selectedPackages);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      emergency_contact: '',
      expected_delivery_date: '',
      pregnancy_stage: 'second_trimester'
    });
    setSelectedPackageIds([]);
    setStep('form');
    setShowPaymentModal(false);
    onClose();
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
      case 'basic': return <Shield className="h-6 w-6 text-blue-500" />;
      case 'medium': return <Heart className="h-6 w-6 text-purple-500" />;
      case 'comprehensive': return <Star className="h-6 w-6 text-gold-500" />;
      default: return <Package className="h-6 w-6" />;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {step === 'form' && 'Patient Registration'}
              {step === 'packages' && 'Select Healthcare Package'}
              {step === 'payment' && 'Complete Registration'}
            </DialogTitle>
            <DialogDescription>
              {step === 'form' && 'Enter patient information to create a new profile'}
              {step === 'packages' && 'Choose the best healthcare package for your needs'}
              {step === 'payment' && 'Review and complete your package subscription'}
            </DialogDescription>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4 my-4">
            <div className={`flex items-center ${step === 'form' ? 'text-purple-600' : 'text-green-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'form' ? 'bg-purple-100' : 'bg-green-100'
              }`}>
                {step === 'form' ? '1' : <Check className="h-4 w-4" />}
              </div>
              <span className="ml-2 font-medium">Patient Info</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center ${
              step === 'packages' ? 'text-purple-600' : 
              step === 'payment' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'packages' ? 'bg-purple-100' : 
                step === 'payment' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {step === 'payment' ? <Check className="h-4 w-4" /> : '2'}
              </div>
              <span className="ml-2 font-medium">Package Selection</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center ${step === 'payment' ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'payment' ? 'bg-purple-100' : 'bg-gray-100'
              }`}>
                3
              </div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
          </div>

          {/* Form Step */}
          {step === 'form' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact" className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Emergency Contact
                  </Label>
                  <Input
                    id="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                    placeholder="Emergency contact number"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter full address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expected_delivery_date" className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Expected Delivery Date *
                  </Label>
                  <Input
                    id="expected_delivery_date"
                    type="date"
                    value={formData.expected_delivery_date}
                    onChange={(e) => handleInputChange('expected_delivery_date', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pregnancy_stage" className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Pregnancy Stage *
                  </Label>
                  <select
                    id="pregnancy_stage"
                    value={formData.pregnancy_stage}
                    onChange={(e) => handleInputChange('pregnancy_stage', e.target.value as any)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="first_trimester">First Trimester (0-12 weeks)</option>
                    <option value="second_trimester">Second Trimester (13-26 weeks)</option>
                    <option value="third_trimester">Third Trimester (27-40 weeks)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleFormSubmit} disabled={!isFormValid()}>
                  Next: Select Package
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Package Selection Step */}
          {step === 'packages' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                {HEALTHCARE_PACKAGES.map((pkg) => {
                  const isSelected = selectedPackageIds.includes(pkg.id);
                  
                  return (
                    <Card 
                      key={pkg.id}
                      className={`cursor-pointer transition-all ${
                        isSelected 
                          ? 'ring-2 ring-purple-500 shadow-lg transform scale-105' 
                          : 'hover:shadow-md'
                      } ${pkg.popular ? 'border-purple-200' : ''}`}
                      onClick={() => handlePackageToggle(pkg.id)}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            <Star className="h-3 w-3 mr-1" />
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      
                      <CardHeader className="text-center space-y-3">
                        {getPackageIcon(pkg.name)}
                        <div>
                          <h3 className="font-bold text-lg">{pkg.displayName}</h3>
                          <p className="text-sm text-gray-600">{pkg.description}</p>
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatPrice(pkg.price)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {pkg.duration} months
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <Button
                          className={`w-full ${
                            isSelected
                              ? 'bg-purple-600 hover:bg-purple-700'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                          }`}
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

              {/* Price Summary */}
              {selectedPackageIds.length > 0 && (
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg">Selection Summary</h3>
                      
                      {calculation.breakdown.map((item) => (
                        <div key={item.packageId} className="flex justify-between">
                          <span>{item.name}</span>
                          <span>{formatPrice(item.price)}</span>
                        </div>
                      ))}
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span>Total Amount</span>
                        <span className="text-purple-600">{formatPrice(calculation.total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('form')}>
                  Back to Form
                </Button>
                <Button 
                  onClick={handlePackageSelection}
                  disabled={selectedPackageIds.length === 0 || loading}
                >
                  {loading ? 'Creating Profile...' : 'Proceed to Payment'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <PackagePaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedPackages={calculation.packages}
        totalAmount={calculation.total}
        patientId={createdPatientId}
        onPaymentComplete={handlePaymentComplete}
      />
    </>
  );
}