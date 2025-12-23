/**
 * Unified Payment Gateway Interface
 * Supports multiple payment providers: Stripe, PayPal, Payoneer, WorldFirst
 */

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  PAYONEER = 'PAYONEER',
  WORLDFIRST = 'WORLDFIRST',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export enum TransactionType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  ONE_TIME = 'ONE_TIME',
  REFUND = 'REFUND',
  PAYOUT = 'PAYOUT',
}

export interface PaymentCustomer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, any>;
}

export interface PaymentMethod {
  id: string;
  type: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  amount: number;
  currency: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description?: string;
  createdAt: Date;
  paidAt?: Date;
  dueDate?: Date;
  invoiceNumber: string;
  pdfUrl?: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  customerId: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  reason?: string;
  createdAt: Date;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  provider: PaymentProvider;
  timestamp: Date;
}

/**
 * Payment Gateway Interface
 * All payment providers must implement this interface
 */
export interface IPaymentGateway {
  readonly provider: PaymentProvider;

  // Customer Management
  createCustomer(data: {
    email: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, any>;
  }): Promise<PaymentCustomer>;

  getCustomer(customerId: string): Promise<PaymentCustomer>;

  updateCustomer(
    customerId: string,
    data: Partial<PaymentCustomer>,
  ): Promise<PaymentCustomer>;

  deleteCustomer(customerId: string): Promise<void>;

  // Payment Methods
  attachPaymentMethod(
    customerId: string,
    paymentMethodId: string,
  ): Promise<PaymentMethod>;

  detachPaymentMethod(paymentMethodId: string): Promise<void>;

  listPaymentMethods(customerId: string): Promise<PaymentMethod[]>;

  setDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string,
  ): Promise<void>;

  // Subscriptions
  createSubscription(data: {
    customerId: string;
    planId: string;
    paymentMethodId?: string;
    trialDays?: number;
    metadata?: Record<string, any>;
  }): Promise<Subscription>;

  getSubscription(subscriptionId: string): Promise<Subscription>;

  updateSubscription(
    subscriptionId: string,
    data: { planId?: string; metadata?: Record<string, any> },
  ): Promise<Subscription>;

  cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd?: boolean,
  ): Promise<Subscription>;

  // Invoices
  getInvoice(invoiceId: string): Promise<Invoice>;

  listInvoices(customerId: string, limit?: number): Promise<Invoice[]>;

  // Payments
  createPayment(data: {
    amount: number;
    currency: string;
    customerId: string;
    paymentMethodId?: string;
    description?: string;
    metadata?: Record<string, any>;
  }): Promise<Payment>;

  capturePayment(paymentId: string): Promise<Payment>;

  // Refunds
  createRefund(data: {
    paymentId: string;
    amount?: number;
    reason?: string;
  }): Promise<Refund>;

  getRefund(refundId: string): Promise<Refund>;

  // Webhooks
  validateWebhook(payload: any, signature: string, secret: string): boolean;

  parseWebhookEvent(payload: any): WebhookEvent;

  // Utility
  isConfigured(): boolean;
}
