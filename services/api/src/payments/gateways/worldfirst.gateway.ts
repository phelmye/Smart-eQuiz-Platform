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
 * WorldFirst Payment Gateway Implementation
 * Supports WorldFirst API for international payments and currency exchange
 */
@Injectable()
export class WorldFirstGateway implements IPaymentGateway {
  readonly provider = PaymentProvider.WORLDFIRST;
  private client: AxiosInstance | null = null;
  private readonly logger = new Logger(WorldFirstGateway.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('WORLDFIRST_API_KEY');
    const apiSecret = this.configService.get<string>('WORLDFIRST_API_SECRET');
    const environment = this.configService.get<string>('WORLDFIRST_ENVIRONMENT') || 'sandbox';

    if (apiKey && apiSecret) {
      const baseURL =
        environment === 'production'
          ? 'https://api.worldfirst.com'
          : 'https://api.sandbox.worldfirst.com';

      this.client = axios.create({
        baseURL,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
          'X-API-Secret': apiSecret,
        },
      });

      this.logger.log(`WorldFirst gateway initialized (${environment})`);
    } else {
      this.logger.warn('WorldFirst not configured - credentials missing');
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  private ensureConfigured(): AxiosInstance {
    if (!this.client) {
      throw new Error('WorldFirst is not configured');
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

    const response = await client.post('/v1/customers', {
      email: data.email,
      name: data.name,
      phone: data.phone,
      type: 'business', // or 'individual'
      metadata: data.metadata,
    });

    const customer = response.data;

    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      metadata: { ...data.metadata, provider: 'worldfirst' },
    };
  }

  async getCustomer(customerId: string): Promise<PaymentCustomer> {
    const client = this.ensureConfigured();

    const response = await client.get(`/v1/customers/${customerId}`);
    const customer = response.data;

    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      metadata: customer.metadata,
    };
  }

  async updateCustomer(
    customerId: string,
    data: Partial<PaymentCustomer>,
  ): Promise<PaymentCustomer> {
    const client = this.ensureConfigured();

    await client.patch(`/v1/customers/${customerId}`, {
      email: data.email,
      name: data.name,
      phone: data.phone,
      metadata: data.metadata,
    });

    return this.getCustomer(customerId);
  }

  async deleteCustomer(customerId: string): Promise<void> {
    const client = this.ensureConfigured();
    await client.delete(`/v1/customers/${customerId}`);
  }

  async attachPaymentMethod(
    customerId: string,
    paymentMethodId: string,
  ): Promise<PaymentMethod> {
    const client = this.ensureConfigured();

    const response = await client.post(`/v1/customers/${customerId}/payment-methods`, {
      payment_method_id: paymentMethodId,
    });

    return {
      id: response.data.id,
      type: response.data.type,
      isDefault: response.data.is_default,
    };
  }

  async detachPaymentMethod(paymentMethodId: string): Promise<void> {
    const client = this.ensureConfigured();
    await client.delete(`/v1/payment-methods/${paymentMethodId}`);
  }

  async listPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    const client = this.ensureConfigured();

    const response = await client.get(`/v1/customers/${customerId}/payment-methods`);

    return response.data.payment_methods.map((pm: any) => ({
      id: pm.id,
      type: pm.type,
      isDefault: pm.is_default,
    }));
  }

  async setDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string,
  ): Promise<void> {
    const client = this.ensureConfigured();

    await client.patch(`/v1/customers/${customerId}/payment-methods/${paymentMethodId}`, {
      is_default: true,
    });
  }

  async createSubscription(data: {
    customerId: string;
    planId: string;
    paymentMethodId?: string;
    trialDays?: number;
    metadata?: Record<string, any>;
  }): Promise<Subscription> {
    // WorldFirst doesn't have native subscription support
    // Would require custom recurring payment implementation
    throw new Error('WorldFirst subscriptions require custom implementation');
  }

  async getSubscription(subscriptionId: string): Promise<Subscription> {
    throw new Error('WorldFirst subscriptions require custom implementation');
  }

  async updateSubscription(
    subscriptionId: string,
    data: { planId?: string; metadata?: Record<string, any> },
  ): Promise<Subscription> {
    throw new Error('WorldFirst subscriptions require custom implementation');
  }

  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd = true,
  ): Promise<Subscription> {
    throw new Error('WorldFirst subscriptions require custom implementation');
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    throw new Error('WorldFirst invoice management requires custom implementation');
  }

  async listInvoices(customerId: string, limit = 100): Promise<Invoice[]> {
    throw new Error('WorldFirst invoice management requires custom implementation');
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

    const response = await client.post('/v1/payments', {
      customer_id: data.customerId,
      amount: (data.amount / 100).toFixed(2),
      currency: data.currency.toUpperCase(),
      payment_method_id: data.paymentMethodId,
      description: data.description,
      metadata: data.metadata,
    });

    const payment = response.data;

    return {
      id: payment.id,
      amount: data.amount,
      currency: data.currency,
      status: this.mapWorldFirstStatus(payment.status),
      customerId: data.customerId,
      description: data.description,
      metadata: data.metadata,
      createdAt: new Date(payment.created_at),
    };
  }

  async capturePayment(paymentId: string): Promise<Payment> {
    const client = this.ensureConfigured();

    const response = await client.post(`/v1/payments/${paymentId}/capture`);
    const payment = response.data;

    return {
      id: payment.id,
      amount: parseInt((parseFloat(payment.amount) * 100).toFixed(0)),
      currency: payment.currency,
      status: PaymentStatus.COMPLETED,
      customerId: payment.customer_id,
      createdAt: new Date(payment.created_at),
    };
  }

  async createRefund(data: {
    paymentId: string;
    amount?: number;
    reason?: string;
  }): Promise<Refund> {
    const client = this.ensureConfigured();

    const response = await client.post(`/v1/payments/${data.paymentId}/refunds`, {
      amount: data.amount ? (data.amount / 100).toFixed(2) : undefined,
      reason: data.reason,
    });

    const refund = response.data;

    return {
      id: refund.id,
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

    const response = await client.get(`/v1/refunds/${refundId}`);
    const refund = response.data;

    return {
      id: refund.id,
      paymentId: refund.payment_id,
      amount: parseInt((parseFloat(refund.amount) * 100).toFixed(0)),
      currency: refund.currency,
      status: this.mapWorldFirstStatus(refund.status),
      createdAt: new Date(refund.created_at),
    };
  }

  validateWebhook(payload: any, signature: string, secret: string): boolean {
    // WorldFirst webhook validation
    this.logger.warn('WorldFirst webhook validation not yet implemented');
    return true; // TODO: Implement proper validation
  }

  parseWebhookEvent(payload: any): WebhookEvent {
    return {
      id: payload.id,
      type: payload.event_type,
      data: payload.data,
      provider: PaymentProvider.WORLDFIRST,
      timestamp: new Date(payload.timestamp),
    };
  }

  private mapWorldFirstStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      COMPLETED: PaymentStatus.COMPLETED,
      SUCCESS: PaymentStatus.COMPLETED,
      PENDING: PaymentStatus.PENDING,
      PROCESSING: PaymentStatus.PROCESSING,
      FAILED: PaymentStatus.FAILED,
      CANCELLED: PaymentStatus.CANCELLED,
      REFUNDED: PaymentStatus.REFUNDED,
    };
    return statusMap[status] || PaymentStatus.PENDING;
  }
}
