import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  IPaymentGateway,
  PaymentProvider,
  PaymentStatus,
  PaymentCustomer,
  PaymentMethod,
  Subscription,
  Invoice,
  Payment,
  Refund,
  WebhookEvent,
} from '../payment-gateway.interface';

/**
 * Payoneer Payment Gateway Implementation
 * Supports Payoneer API for global payments
 */
@Injectable()
export class PayoneerGateway implements IPaymentGateway {
  readonly provider = PaymentProvider.PAYONEER;
  private client: AxiosInstance | null = null;
  private readonly logger = new Logger(PayoneerGateway.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('PAYONEER_API_KEY');
    const apiSecret = this.configService.get<string>('PAYONEER_API_SECRET');
    const environment = this.configService.get<string>('PAYONEER_ENVIRONMENT') || 'sandbox';

    if (apiKey && apiSecret) {
      const baseURL =
        environment === 'production'
          ? 'https://api.payoneer.com'
          : 'https://api.sandbox.payoneer.com';

      this.client = axios.create({
        baseURL,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      });

      this.logger.log(`Payoneer gateway initialized (${environment})`);
    } else {
      this.logger.warn('Payoneer not configured - credentials missing');
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  private ensureConfigured(): AxiosInstance {
    if (!this.client) {
      throw new Error('Payoneer is not configured');
    }
    return this.client;
  }

  async createCustomer(data: {
    email: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, any>;
  }): Promise<PaymentCustomer> {
    const client = this.ensureConfigured();

    const response = await client.post('/v4/programs/payees', {
      payee_id: `customer_${Date.now()}`,
      type: 'INDIVIDUAL',
      contact: {
        email: data.email,
        first_name: data.name?.split(' ')[0],
        last_name: data.name?.split(' ').slice(1).join(' '),
        phone: data.phone,
      },
    });

    const payee = response.data;

    return {
      id: payee.payee_id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      metadata: { ...data.metadata, provider: 'payoneer' },
    };
  }

  async getCustomer(customerId: string): Promise<PaymentCustomer> {
    const client = this.ensureConfigured();

    const response = await client.get(`/v4/programs/payees/${customerId}`);
    const payee = response.data;

    return {
      id: payee.payee_id,
      email: payee.contact.email,
      name: `${payee.contact.first_name} ${payee.contact.last_name}`,
      phone: payee.contact.phone,
    };
  }

  async updateCustomer(
    customerId: string,
    data: Partial<PaymentCustomer>,
  ): Promise<PaymentCustomer> {
    const client = this.ensureConfigured();

    await client.patch(`/v4/programs/payees/${customerId}`, {
      contact: {
        email: data.email,
        first_name: data.name?.split(' ')[0],
        last_name: data.name?.split(' ').slice(1).join(' '),
        phone: data.phone,
      },
    });

    return this.getCustomer(customerId);
  }

  async deleteCustomer(customerId: string): Promise<void> {
    const client = this.ensureConfigured();
    await client.delete(`/v4/programs/payees/${customerId}`);
  }

  async attachPaymentMethod(
    customerId: string,
    paymentMethodId: string,
  ): Promise<PaymentMethod> {
    // Payoneer manages payment methods internally
    return {
      id: paymentMethodId,
      type: 'payoneer',
      isDefault: true,
    };
  }

  async detachPaymentMethod(paymentMethodId: string): Promise<void> {
    this.logger.log(`Payoneer payment method management handled internally: ${paymentMethodId}`);
  }

  async listPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    // Payoneer handles payment methods internally
    return [];
  }

  async setDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string,
  ): Promise<void> {
    // Not applicable for Payoneer
  }

  async createSubscription(data: {
    customerId: string;
    planId: string;
    paymentMethodId?: string;
    trialDays?: number;
    metadata?: Record<string, any>;
  }): Promise<Subscription> {
    // Payoneer doesn't have native subscription support
    // This would require custom implementation with recurring payments
    throw new Error('Payoneer subscriptions require custom implementation');
  }

  async getSubscription(subscriptionId: string): Promise<Subscription> {
    throw new Error('Payoneer subscriptions require custom implementation');
  }

  async updateSubscription(
    subscriptionId: string,
    data: { planId?: string; metadata?: Record<string, any> },
  ): Promise<Subscription> {
    throw new Error('Payoneer subscriptions require custom implementation');
  }

  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd = true,
  ): Promise<Subscription> {
    throw new Error('Payoneer subscriptions require custom implementation');
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    throw new Error('Payoneer invoice management requires custom implementation');
  }

  async listInvoices(customerId: string, limit = 100): Promise<Invoice[]> {
    throw new Error('Payoneer invoice management requires custom implementation');
  }

  async createPayment(data: {
    amount: number;
    currency: string;
    customerId: string;
    paymentMethodId?: string;
    description?: string;
    metadata?: Record<string, any>;
  }): Promise<Payment> {
    const client = this.ensureConfigured();

    const response = await client.post('/v4/charges', {
      payee_id: data.customerId,
      amount: (data.amount / 100).toFixed(2),
      currency: data.currency.toUpperCase(),
      description: data.description,
      client_reference_id: data.metadata?.reference_id,
    });

    const payment = response.data;

    return {
      id: payment.charge_id,
      amount: data.amount,
      currency: data.currency,
      status: this.mapPayoneerStatus(payment.status),
      customerId: data.customerId,
      description: data.description,
      metadata: data.metadata,
      createdAt: new Date(payment.created_at),
    };
  }

  async capturePayment(paymentId: string): Promise<Payment> {
    const client = this.ensureConfigured();

    const response = await client.post(`/v4/charges/${paymentId}/capture`);
    const payment = response.data;

    return {
      id: payment.charge_id,
      amount: parseInt((parseFloat(payment.amount) * 100).toFixed(0)),
      currency: payment.currency,
      status: PaymentStatus.COMPLETED,
      customerId: payment.payee_id,
      createdAt: new Date(payment.created_at),
    };
  }

  async createRefund(data: {
    paymentId: string;
    amount?: number;
    reason?: string;
  }): Promise<Refund> {
    const client = this.ensureConfigured();

    const response = await client.post(`/v4/charges/${data.paymentId}/refunds`, {
      amount: data.amount ? (data.amount / 100).toFixed(2) : undefined,
      reason: data.reason,
    });

    const refund = response.data;

    return {
      id: refund.refund_id,
      paymentId: data.paymentId,
      amount: parseInt((parseFloat(refund.amount) * 100).toFixed(0)),
      currency: refund.currency,
      status: PaymentStatus.REFUNDED,
      reason: data.reason,
      createdAt: new Date(refund.created_at),
    };
  }

  async getRefund(refundId: string): Promise<Refund> {
    const client = this.ensureConfigured();

    const response = await client.get(`/v4/refunds/${refundId}`);
    const refund = response.data;

    return {
      id: refund.refund_id,
      paymentId: refund.charge_id,
      amount: parseInt((parseFloat(refund.amount) * 100).toFixed(0)),
      currency: refund.currency,
      status: this.mapPayoneerStatus(refund.status),
      createdAt: new Date(refund.created_at),
    };
  }

  validateWebhook(payload: any, signature: string, secret: string): boolean {
    // Payoneer webhook validation
    this.logger.warn('Payoneer webhook validation not yet implemented');
    return true; // TODO: Implement proper validation
  }

  parseWebhookEvent(payload: any): WebhookEvent {
    return {
      id: payload.event_id,
      type: payload.event_type,
      data: payload.data,
      provider: PaymentProvider.PAYONEER,
      timestamp: new Date(payload.timestamp),
    };
  }

  private mapPayoneerStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      COMPLETED: PaymentStatus.COMPLETED,
      PENDING: PaymentStatus.PENDING,
      PROCESSING: PaymentStatus.PROCESSING,
      FAILED: PaymentStatus.FAILED,
      CANCELLED: PaymentStatus.CANCELLED,
      REFUNDED: PaymentStatus.REFUNDED,
    };
    return statusMap[status] || PaymentStatus.PENDING;
  }
}
