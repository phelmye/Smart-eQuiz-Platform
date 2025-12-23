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
 * PayPal Payment Gateway Implementation
 * Supports PayPal REST API v2
 */
@Injectable()
export class PayPalGateway implements IPaymentGateway {
  readonly provider = PaymentProvider.PAYPAL;
  private client: AxiosInstance | null = null;
  private readonly logger = new Logger(PayPalGateway.name);
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private configService: ConfigService) {
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    const environment = this.configService.get<string>('PAYPAL_ENVIRONMENT') || 'sandbox';

    if (clientId && clientSecret) {
      const baseURL =
        environment === 'production'
          ? 'https://api.paypal.com'
          : 'https://api.sandbox.paypal.com';

      this.client = axios.create({
        baseURL,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(`PayPal gateway initialized (${environment})`);
    } else {
      this.logger.warn('PayPal not configured - credentials missing');
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  private async getAccessToken(): Promise<string> {
    if (!this.client) throw new Error('PayPal not configured');

    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');

    const response = await this.client.post(
      '/v1/oauth2/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: clientId!,
          password: clientSecret!,
        },
      },
    );

    this.accessToken = response.data.access_token;
    this.tokenExpiry = new Date(Date.now() + response.data.expires_in * 1000);

    return this.accessToken;
  }

  private async request(method: string, url: string, data?: any) {
    if (!this.client) throw new Error('PayPal not configured');

    const token = await this.getAccessToken();
    return this.client.request({
      method,
      url,
      data,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async createCustomer(data: {
    email: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, any>;
  }): Promise<PaymentCustomer> {
    // PayPal doesn't have a "customer" concept like Stripe
    // We'll store customer info in metadata and return a generated ID
    const customerId = `paypal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: customerId,
      email: data.email,
      name: data.name,
      phone: data.phone,
      metadata: { ...data.metadata, provider: 'paypal' },
    };
  }

  async getCustomer(customerId: string): Promise<PaymentCustomer> {
    // For PayPal, we'll need to retrieve from our database
    throw new Error('PayPal customer retrieval requires database lookup');
  }

  async updateCustomer(
    customerId: string,
    data: Partial<PaymentCustomer>,
  ): Promise<PaymentCustomer> {
    throw new Error('PayPal customer update requires database implementation');
  }

  async deleteCustomer(customerId: string): Promise<void> {
    // PayPal doesn't support customer deletion
    this.logger.log(`PayPal customer deletion not supported: ${customerId}`);
  }

  async attachPaymentMethod(
    customerId: string,
    paymentMethodId: string,
  ): Promise<PaymentMethod> {
    // PayPal uses payment tokens, not persistent payment methods
    return {
      id: paymentMethodId,
      type: 'paypal',
      isDefault: true,
    };
  }

  async detachPaymentMethod(paymentMethodId: string): Promise<void> {
    this.logger.log(`PayPal payment method detachment not applicable: ${paymentMethodId}`);
  }

  async listPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    // PayPal doesn't store payment methods like Stripe
    return [];
  }

  async setDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string,
  ): Promise<void> {
    // Not applicable for PayPal
  }

  async createSubscription(data: {
    customerId: string;
    planId: string;
    paymentMethodId?: string;
    trialDays?: number;
    metadata?: Record<string, any>;
  }): Promise<Subscription> {
    const response = await this.request('POST', '/v1/billing/subscriptions', {
      plan_id: data.planId,
      subscriber: {
        email_address: data.metadata?.email,
      },
      application_context: {
        brand_name: 'Smart eQuiz Platform',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
      },
    });

    const subscription = response.data;

    return {
      id: subscription.id,
      customerId: data.customerId,
      planId: data.planId,
      status: this.mapPayPalStatus(subscription.status),
      currentPeriodStart: new Date(subscription.start_time),
      currentPeriodEnd: new Date(subscription.billing_info.next_billing_time),
      cancelAtPeriodEnd: false,
      amount: parseInt(subscription.billing_info.last_payment.amount.value) * 100,
      currency: subscription.billing_info.last_payment.amount.currency_code,
    };
  }

  async getSubscription(subscriptionId: string): Promise<Subscription> {
    const response = await this.request('GET', `/v1/billing/subscriptions/${subscriptionId}`);
    const subscription = response.data;

    return {
      id: subscription.id,
      customerId: subscription.subscriber.email_address,
      planId: subscription.plan_id,
      status: this.mapPayPalStatus(subscription.status),
      currentPeriodStart: new Date(subscription.start_time),
      currentPeriodEnd: new Date(subscription.billing_info.next_billing_time),
      cancelAtPeriodEnd: false,
      amount: parseInt(subscription.billing_info.last_payment.amount.value) * 100,
      currency: subscription.billing_info.last_payment.amount.currency_code,
    };
  }

  async updateSubscription(
    subscriptionId: string,
    data: { planId?: string; metadata?: Record<string, any> },
  ): Promise<Subscription> {
    if (data.planId) {
      await this.request('POST', `/v1/billing/subscriptions/${subscriptionId}/revise`, {
        plan_id: data.planId,
      });
    }

    return this.getSubscription(subscriptionId);
  }

  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd = true,
  ): Promise<Subscription> {
    await this.request('POST', `/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      reason: 'Customer requested cancellation',
    });

    return this.getSubscription(subscriptionId);
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    const response = await this.request('GET', `/v2/invoicing/invoices/${invoiceId}`);
    const invoice = response.data;

    return {
      id: invoice.id,
      customerId: invoice.primary_recipients[0]?.billing_info?.email_address || '',
      amount: parseInt(invoice.amount.value) * 100,
      currency: invoice.amount.currency_code,
      status: this.mapPayPalInvoiceStatus(invoice.status),
      description: invoice.detail?.memo,
      createdAt: new Date(invoice.invoice_date),
      invoiceNumber: invoice.detail?.invoice_number || invoice.id,
      pdfUrl: invoice.detail?.pdf_url,
    };
  }

  async listInvoices(customerId: string, limit = 100): Promise<Invoice[]> {
    const response = await this.request('GET', '/v2/invoicing/invoices', {
      params: {
        page_size: limit,
      },
    });

    return response.data.invoices.map((invoice: any) => ({
      id: invoice.id,
      customerId: invoice.primary_recipients[0]?.billing_info?.email_address || '',
      amount: parseInt(invoice.amount.value) * 100,
      currency: invoice.amount.currency_code,
      status: this.mapPayPalInvoiceStatus(invoice.status),
      description: invoice.detail?.memo,
      createdAt: new Date(invoice.invoice_date),
      invoiceNumber: invoice.detail?.invoice_number || invoice.id,
    }));
  }

  async createPayment(data: {
    amount: number;
    currency: string;
    customerId: string;
    paymentMethodId?: string;
    description?: string;
    metadata?: Record<string, any>;
  }): Promise<Payment> {
    const response = await this.request('POST', '/v2/checkout/orders', {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: data.currency.toUpperCase(),
            value: (data.amount / 100).toFixed(2),
          },
          description: data.description,
        },
      ],
    });

    const order = response.data;

    return {
      id: order.id,
      amount: data.amount,
      currency: data.currency,
      status: PaymentStatus.PENDING,
      customerId: data.customerId,
      description: data.description,
      metadata: data.metadata,
      createdAt: new Date(order.create_time),
    };
  }

  async capturePayment(paymentId: string): Promise<Payment> {
    const response = await this.request('POST', `/v2/checkout/orders/${paymentId}/capture`);
    const order = response.data;

    return {
      id: order.id,
      amount: parseInt(order.purchase_units[0].payments.captures[0].amount.value) * 100,
      currency: order.purchase_units[0].payments.captures[0].amount.currency_code,
      status: PaymentStatus.COMPLETED,
      customerId: '',
      createdAt: new Date(order.create_time),
    };
  }

  async createRefund(data: {
    paymentId: string;
    amount?: number;
    reason?: string;
  }): Promise<Refund> {
    const response = await this.request('POST', `/v2/payments/captures/${data.paymentId}/refund`, {
      amount: data.amount
        ? {
            value: (data.amount / 100).toFixed(2),
            currency_code: 'USD',
          }
        : undefined,
      note_to_payer: data.reason,
    });

    const refund = response.data;

    return {
      id: refund.id,
      paymentId: data.paymentId,
      amount: parseInt(refund.amount.value) * 100,
      currency: refund.amount.currency_code,
      status: this.mapPayPalRefundStatus(refund.status),
      reason: data.reason,
      createdAt: new Date(refund.create_time),
    };
  }

  async getRefund(refundId: string): Promise<Refund> {
    const response = await this.request('GET', `/v2/payments/refunds/${refundId}`);
    const refund = response.data;

    return {
      id: refund.id,
      paymentId: refund.invoice_id,
      amount: parseInt(refund.amount.value) * 100,
      currency: refund.amount.currency_code,
      status: this.mapPayPalRefundStatus(refund.status),
      createdAt: new Date(refund.create_time),
    };
  }

  validateWebhook(payload: any, signature: string, secret: string): boolean {
    // PayPal webhook validation requires complex crypto verification
    // Implementation depends on specific webhook setup
    this.logger.warn('PayPal webhook validation not yet implemented');
    return true; // TODO: Implement proper validation
  }

  parseWebhookEvent(payload: any): WebhookEvent {
    return {
      id: payload.id,
      type: payload.event_type,
      data: payload.resource,
      provider: PaymentProvider.PAYPAL,
      timestamp: new Date(payload.create_time),
    };
  }

  private mapPayPalStatus(status: string): any {
    const statusMap: Record<string, string> = {
      ACTIVE: 'active',
      SUSPENDED: 'past_due',
      CANCELLED: 'cancelled',
      EXPIRED: 'cancelled',
      APPROVAL_PENDING: 'trialing',
    };
    return statusMap[status] || 'active';
  }

  private mapPayPalInvoiceStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      PAID: PaymentStatus.COMPLETED,
      SENT: PaymentStatus.PENDING,
      DRAFT: PaymentStatus.PENDING,
      CANCELLED: PaymentStatus.CANCELLED,
      REFUNDED: PaymentStatus.REFUNDED,
      PAYMENT_PENDING: PaymentStatus.PROCESSING,
    };
    return statusMap[status] || PaymentStatus.PENDING;
  }

  private mapPayPalRefundStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      COMPLETED: PaymentStatus.REFUNDED,
      PENDING: PaymentStatus.PROCESSING,
      FAILED: PaymentStatus.FAILED,
      CANCELLED: PaymentStatus.CANCELLED,
    };
    return statusMap[status] || PaymentStatus.PROCESSING;
  }
}
