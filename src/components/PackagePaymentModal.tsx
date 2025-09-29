import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  Calendar,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { 
  PackagePaymentCalculator,
  type HealthcarePackage 
} from '../lib/packagePricingSystem';

interface PackagePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackages: HealthcarePackage[];
  totalAmount: number;
  patientId: string;
  onPaymentComplete: (paymentId: string) => void;
}

// Simplified payment methods for package payments
const PACKAGE_PAYMENT_METHODS = [
  {
    id: 'upi',
    name: 'UPI',
    icon: <Smartphone className="h-6 w-6" />,
    description: 'Pay instantly using UPI',
    processingTime: 'Instant',
    popular: true
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: <CreditCard className="h-6 w-6" />,
    description: 'Secure card payment',
    processingTime: 'Instant'
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    icon: <Building2 className="h-6 w-6" />,
    description: 'Pay through your bank',
    processingTime: '2-5 minutes'
  },
  {
    id: 'wallet',
    name: 'Digital Wallet',
    icon: <Wallet className="h-6 w-6" />,
    description: 'Paytm, PhonePe, GooglePay',
    processingTime: 'Instant'
  }
];

export default function PackagePaymentModal({
  isOpen,
  onClose,
  selectedPackages,
  totalAmount,
  patientId,
  onPaymentComplete
}: PackagePaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'method' | 'processing' | 'success'>('method');
  const [calculation, setCalculation] = useState(PackagePaymentCalculator.calculatePackageTotal([]));

  useEffect(() => {
    if (selectedPackages.length > 0) {
      const packageIds = selectedPackages.map(pkg => pkg.id);
      setCalculation(PackagePaymentCalculator.calculatePackageTotal(packageIds));
    }
  }, [selectedPackages]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handlePayment = async () => {
    if (!selectedMethod) return;

    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      // Simulate package payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Create payment record in database
      const packageIds = selectedPackages.map(pkg => pkg.id);
      const subscription = await PackagePaymentCalculator.createPackageSubscription(
        patientId, 
        packageIds
      );

      setPaymentStep('success');
      
      // Call completion handler after a delay
      setTimeout(() => {
        onPaymentComplete(subscription.subscriptionId);
        onClose();
        setPaymentStep('method');
        setSelectedMethod('');
      }, 2000);

    } catch (error) {
      console.error('Package payment error:', error);
      setIsProcessing(false);
      setPaymentStep('method');
      alert('Payment failed. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            Complete Your Package Payment
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Package Summary */}
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg">Package Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedPackages.map((pkg) => (
                <div key={pkg.id} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{pkg.displayName}</div>
                    <div className="text-sm text-gray-600">{pkg.duration} months</div>
                  </div>
                  <div className="font-medium">{formatPrice(pkg.price)}</div>
                </div>
              ))}
              
              <Separator />
              
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
                
                <Separator />
                
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total Amount</span>
                  <span className="text-purple-600">{formatPrice(calculation.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Steps */}
          {paymentStep === 'method' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Payment Method</h3>
              
              <div className="grid gap-3">
                {PACKAGE_PAYMENT_METHODS.map((method) => (
                  <Card
                    key={method.id}
                    className={`cursor-pointer transition-all ${
                      selectedMethod === method.id
                        ? 'ring-2 ring-purple-500 bg-purple-50'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-purple-600">{method.icon}</div>
                        <div>
                          <div className="font-medium flex items-center">
                            {method.name}
                            {method.popular && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Popular
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">{method.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {method.processingTime}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                onClick={handlePayment}
                disabled={!selectedMethod || isProcessing}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg"
              >
                Pay {formatPrice(calculation.total)}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Your payment is secured with 256-bit SSL encryption
              </p>
            </div>
          )}

          {/* Processing Step */}
          {paymentStep === 'processing' && (
            <div className="text-center py-8 space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
              <h3 className="text-xl font-semibold">Processing Payment...</h3>
              <p className="text-gray-600">Please wait while we process your package payment</p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  Do not close this window or refresh the page
                </p>
              </div>
            </div>
          )}

          {/* Success Step */}
          {paymentStep === 'success' && (
            <div className="text-center py-8 space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold text-green-700">Payment Successful!</h3>
              <p className="text-gray-600">
                Your healthcare package subscription has been activated
              </p>
              <div className="bg-green-50 p-4 rounded-lg space-y-2">
                <p className="text-sm text-green-800 font-medium">
                  Package Amount: {formatPrice(calculation.total)}
                </p>
                <p className="text-xs text-green-700">
                  You will receive a confirmation email shortly
                </p>
              </div>
            </div>
          )}

          {/* Package Benefits Reminder */}
          {paymentStep === 'method' && (
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-purple-800 mb-2">What's Included:</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• 24/7 emergency consultation support</li>
                  <li>• Dedicated care team assignment</li>
                  <li>• Comprehensive health tracking</li>
                  <li>• Educational resources and guidance</li>
                  <li>• Family planning consultation</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}