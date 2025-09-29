import { PaymentService } from './supabaseService';

// Razorpay Payment Gateway Integration
export class RazorpayPaymentGateway {
  private static RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_key';
  
  // Initialize Razorpay payment
  static async initiatePayment(paymentData: {
    amount: number;
    currency: string;
    patientId: string;
    packageId: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
  }) {
    try {
      // Create order in our database first
      const payment = await PaymentService.createPayment({
        patient_id: paymentData.patientId,
        package_id: paymentData.packageId,
        amount: paymentData.amount,
        payment_method: 'razorpay'
      });

      // Razorpay options
      const options = {
        key: this.RAZORPAY_KEY,
        amount: paymentData.amount * 100, // Razorpay expects amount in paise
        currency: paymentData.currency,
        name: 'Pregacare Healthcare',
        description: 'Healthcare Package Subscription',
        order_id: payment.payment_id, // Use our payment ID as order ID
        handler: async (response: any) => {
          // Payment success handler
          try {
            await this.verifyPayment(response, payment.payment_id);
          } catch (error) {
            console.error('Payment verification failed:', error);
            throw error;
          }
        },
        prefill: {
          name: paymentData.patientName,
          email: paymentData.patientEmail,
          contact: paymentData.patientPhone,
        },
        notes: {
          patient_id: paymentData.patientId,
          package_id: paymentData.packageId,
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: () => {
            // Payment cancelled
            PaymentService.updatePaymentStatus(payment.payment_id, 'failed');
          },
        },
      };

      // Open Razorpay checkout
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      
      return payment;
    } catch (error) {
      console.error('Payment initiation failed:', error);
      throw error;
    }
  }

  // Verify payment after successful payment
  static async verifyPayment(razorpayResponse: any, paymentId: string) {
    try {
      // In production, you would verify the signature on your backend
      // For now, we'll update the payment status directly
      await PaymentService.updatePaymentStatus(paymentId, 'completed');
      
      return {
        success: true,
        paymentId,
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        razorpayOrderId: razorpayResponse.razorpay_order_id,
        razorpaySignature: razorpayResponse.razorpay_signature,
      };
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw error;
    }
  }

  // Handle payment failure
  static async handlePaymentFailure(paymentId: string, error: any) {
    try {
      await PaymentService.updatePaymentStatus(paymentId, 'failed');
      
      return {
        success: false,
        paymentId,
        error: error.description || 'Payment failed',
      };
    } catch (err) {
      console.error('Error handling payment failure:', err);
      throw err;
    }
  }
}

// UPI Payment Integration
export class UPIPaymentGateway {
  // Generate UPI payment link
  static generateUPILink(paymentData: {
    amount: number;
    merchantId: string;
    merchantName: string;
    transactionId: string;
    notes?: string;
  }) {
    const upiString = `upi://pay?pa=${paymentData.merchantId}&pn=${encodeURIComponent(paymentData.merchantName)}&tr=${paymentData.transactionId}&am=${paymentData.amount}&cu=INR&tn=${encodeURIComponent(paymentData.notes || 'Healthcare Payment')}`;
    
    return upiString;
  }

  // Process UPI payment
  static async processUPIPayment(paymentData: {
    patientId: string;
    packageId: string;
    amount: number;
    upiId: string;
  }) {
    try {
      // Create payment record
      const payment = await PaymentService.createPayment({
        patient_id: paymentData.patientId,
        package_id: paymentData.packageId,
        amount: paymentData.amount,
        payment_method: 'upi'
      });

      // Generate UPI link
      const upiLink = this.generateUPILink({
        amount: paymentData.amount,
        merchantId: 'pregacare@okaxis', // Example UPI ID
        merchantName: 'Pregacare Healthcare',
        transactionId: payment.payment_id,
        notes: 'Healthcare Package Payment'
      });

      return {
        paymentId: payment.payment_id,
        upiLink,
        qrCode: await this.generateQRCode(upiLink)
      };
    } catch (error) {
      console.error('UPI payment processing failed:', error);
      throw error;
    }
  }

  // Generate QR code for UPI payment
  static async generateQRCode(upiLink: string): Promise<string> {
    // In production, use a QR code library like qrcode
    // For now, return a placeholder
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="white"/><text x="50%" y="50%" text-anchor="middle" dy=".3em">QR Code for UPI Payment</text></svg>`;
  }
}

// Bank Transfer Payment
export class BankTransferPayment {
  private static BANK_DETAILS = {
    accountName: 'Pregacare Healthcare Pvt Ltd',
    accountNumber: '1234567890123456',
    ifscCode: 'HDFC0001234',
    bankName: 'HDFC Bank',
    branch: 'Mumbai Main Branch'
  };

  // Generate bank transfer instructions
  static async generateBankTransferInstructions(paymentData: {
    patientId: string;
    packageId: string;
    amount: number;
  }) {
    try {
      // Create payment record
      const payment = await PaymentService.createPayment({
        patient_id: paymentData.patientId,
        package_id: paymentData.packageId,
        amount: paymentData.amount,
        payment_method: 'bank_transfer'
      });

      return {
        paymentId: payment.payment_id,
        bankDetails: this.BANK_DETAILS,
        amount: paymentData.amount,
        referenceNumber: payment.payment_id,
        instructions: [
          'Transfer the exact amount to the bank account details provided below',
          'Use the payment ID as reference number',
          'Share the transaction screenshot with our support team',
          'Payment will be confirmed within 2-3 business days'
        ]
      };
    } catch (error) {
      console.error('Bank transfer processing failed:', error);
      throw error;
    }
  }

  // Verify bank transfer (manual process)
  static async verifyBankTransfer(paymentId: string, transactionDetails: {
    transactionId: string;
    transactionDate: string;
    amount: number;
    fromAccount: string;
  }) {
    try {
      // In production, this would involve manual verification or banking API
      await PaymentService.updatePaymentStatus(paymentId, 'completed');
      
      return {
        success: true,
        paymentId,
        transactionDetails,
        verifiedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Bank transfer verification failed:', error);
      throw error;
    }
  }
}

// Credit/Debit Card Payment (via Razorpay)
export class CardPaymentGateway {
  // Process card payment using Razorpay
  static async processCardPayment(paymentData: {
    amount: number;
    patientId: string;
    packageId: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
  }) {
    try {
      // Use Razorpay for card payments
      return await RazorpayPaymentGateway.initiatePayment({
        ...paymentData,
        currency: 'INR'
      });
    } catch (error) {
      console.error('Card payment processing failed:', error);
      throw error;
    }
  }
}

// Wallet Payments (Paytm, PhonePe, etc.)
export class WalletPaymentGateway {
  // Process wallet payment
  static async processWalletPayment(paymentData: {
    amount: number;
    patientId: string;
    packageId: string;
    walletType: 'paytm' | 'phonepe' | 'googlepay' | 'amazonpay';
    customerDetails: {
      name: string;
      email: string;
      phone: string;
    };
  }) {
    try {
      // Create payment record
      const payment = await PaymentService.createPayment({
        patient_id: paymentData.patientId,
        package_id: paymentData.packageId,
        amount: paymentData.amount,
        payment_method: paymentData.walletType
      });

      // Redirect to wallet-specific payment flow
      const walletUrls = {
        paytm: `paytm://pay?amount=${paymentData.amount}&merchant=pregacare`,
        phonepe: `phonepe://pay?amount=${paymentData.amount}&merchant=pregacare`,
        googlepay: `tez://upi/pay?amount=${paymentData.amount}&merchant=pregacare`,
        amazonpay: `amazonpay://pay?amount=${paymentData.amount}&merchant=pregacare`
      };

      return {
        paymentId: payment.payment_id,
        redirectUrl: walletUrls[paymentData.walletType],
        deepLinkUrl: walletUrls[paymentData.walletType]
      };
    } catch (error) {
      console.error('Wallet payment processing failed:', error);
      throw error;
    }
  }
}

// EMI/Installment Payments
export class EMIPaymentGateway {
  // Calculate EMI options
  static calculateEMIOptions(principal: number, interestRate: number = 12) {
    const emiOptions = [];
    const tenures = [3, 6, 9, 12, 18, 24];

    tenures.forEach(tenure => {
      const monthlyRate = interestRate / (12 * 100);
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                  (Math.pow(1 + monthlyRate, tenure) - 1);
      
      emiOptions.push({
        tenure,
        emi: Math.round(emi),
        totalAmount: Math.round(emi * tenure),
        interestAmount: Math.round((emi * tenure) - principal)
      });
    });

    return emiOptions;
  }

  // Process EMI payment
  static async processEMIPayment(paymentData: {
    patientId: string;
    packageId: string;
    amount: number;
    tenure: number;
    emiAmount: number;
    customerDetails: {
      name: string;
      email: string;
      phone: string;
      panNumber: string;
      aadhaarNumber: string;
    };
  }) {
    try {
      // Create EMI payment record
      const payment = await PaymentService.createPayment({
        patient_id: paymentData.patientId,
        package_id: paymentData.packageId,
        amount: paymentData.amount,
        payment_method: 'emi'
      });

      // In production, integrate with EMI providers like Bajaj Finserv, ZestMoney, etc.
      
      return {
        paymentId: payment.payment_id,
        emiSchedule: Array.from({ length: paymentData.tenure }, (_, index) => ({
          installmentNumber: index + 1,
          amount: paymentData.emiAmount,
          dueDate: new Date(Date.now() + (index + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending'
        })),
        approvalRequired: true,
        creditCheckRequired: true
      };
    } catch (error) {
      console.error('EMI payment processing failed:', error);
      throw error;
    }
  }
}

// Main Payment Gateway Manager
export class PaymentGatewayManager {
  // Process payment based on method
  static async processPayment(paymentMethod: string, paymentData: any) {
    try {
      switch (paymentMethod) {
        case 'razorpay':
        case 'card':
          return await RazorpayPaymentGateway.initiatePayment(paymentData);
        
        case 'upi':
          return await UPIPaymentGateway.processUPIPayment(paymentData);
        
        case 'bank_transfer':
          return await BankTransferPayment.generateBankTransferInstructions(paymentData);
        
        case 'paytm':
        case 'phonepe':
        case 'googlepay':
        case 'amazonpay':
          return await WalletPaymentGateway.processWalletPayment({
            ...paymentData,
            walletType: paymentMethod as any
          });
        
        case 'emi':
          return await EMIPaymentGateway.processEMIPayment(paymentData);
        
        default:
          throw new Error(`Payment method ${paymentMethod} not supported`);
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw error;
    }
  }

  // Get available payment methods for amount
  static getAvailablePaymentMethods(amount: number) {
    const methods = [
      { id: 'razorpay', name: 'Credit/Debit Card', icon: '💳', minAmount: 1, maxAmount: 1000000 },
      { id: 'upi', name: 'UPI Payment', icon: '📱', minAmount: 1, maxAmount: 100000 },
      { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦', minAmount: 1, maxAmount: 10000000 },
      { id: 'paytm', name: 'Paytm Wallet', icon: '💰', minAmount: 1, maxAmount: 100000 },
      { id: 'phonepe', name: 'PhonePe', icon: '📞', minAmount: 1, maxAmount: 100000 },
      { id: 'googlepay', name: 'Google Pay', icon: '🔍', minAmount: 1, maxAmount: 100000 },
    ];

    // Add EMI option for amounts above ₹5000
    if (amount >= 5000) {
      methods.push({
        id: 'emi',
        name: 'EMI (Easy Installments)',
        icon: '📊',
        minAmount: 5000,
        maxAmount: 1000000
      });
    }

    return methods.filter(method => amount >= method.minAmount && amount <= method.maxAmount);
  }

  // Get payment status
  static async getPaymentStatus(paymentId: string) {
    try {
      const payments = await PaymentService.getAllPayments();
      const payment = payments.find((p: any) => p.payment_id === paymentId);
      
      if (!payment) {
        throw new Error('Payment not found');
      }

      return {
        paymentId,
        status: payment.payment_status,
        amount: payment.amount,
        method: payment.payment_method,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at
      };
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw error;
    }
  }
}