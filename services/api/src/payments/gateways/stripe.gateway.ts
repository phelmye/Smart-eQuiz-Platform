import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
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

@Injectable()
export class StripeGateway implements IPaymentGateway {
  readonly provider = PaymentProvider.STRIPE;
  private stripe: Stripe | null = null;
  private readonly logger = new Logger(StripeGateway.name);

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2023-10-16',
      });
      this.logger.log('Stripe gateway initialized');
    } else {
      this.logger.warn('Stripe not configured - STRIPE_SECRET_KEY missing');
    }
  }

  isConfigured(): boolean {
    return this.stripe !== null;
  }

  private ensureConfigured(): Stripe {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }
    return this.stripe;
  }

  async createCustomer(data: {
    email: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, any>;
  }): Promise<PaymentCustomer> {
    const stripe = this.ensureConfigured();
    const customer = await stripe.customers.create({
      email: data.email,
      name: data.name,
      phone: data.phone,
      metadata: data.metadata,
    });

    return {
      id: customer.id,
      email: customer.email!,
      name: customer.name || undefined,
      phone: customer.phone || undefined,
      metadata: customer.metadata,
    };
  }

  async getCustomer(customerId: string): Promise<PaymentCustomer> {
    const stripe = this.ensureConfigured();
    const customer = await stripe.customers.retrieve(customerId);

    if (customer.deleted) {
      throw new Error('Customer has been deleted');
    }

    return {
      id: customer.id,
      email: customer.email!,
      name: customer.name || undefined,
      phone: customer.phone || undefined,
      metadata: customer.metadata,
    };
  }

  async updateCustomer(
    customerId: string,
    data: Partial<PaymentCustomer>,
  ): Promise<PaymentCustomer> {
    const stripe = this.ensureConfigured();
    const customer = await stripe.customers.update(customerId, {
      email: data.email,
      name: data.name,
      phone: data.phone,
      metadata: data.metadata,
    });

    return {
      id: customer.id,
      email: customer.email!,
      name: customer.name || undefined,
      phone: customer.phone || undefined,
      metadata: customer.metadata,
    };
  }

  async deleteCustomer(customerId: string): Promise<void> {
    const stripe = this.ensureConfigured();
    await stripe.customers.del(customerId);
  }

  async attachPaymentMethod(
    customerId: string,
    paymentMethodId: string,
  ): Promise<PaymentMethod> {
    const stripe = this.ensureConfigured();
    const pm = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    return {
      id: pm.id,
      type: pm.type,
      last4: pm.card?.last4,
      brand: pm.card?.brand,
      expiryMonth: pm.card?.exp_month,
      expiryYear: pm.card?.exp_year,
      isDefault: false,
    };
  }

  async detachPaymentMethod(paymentMethodId: string): Promise<void> {
    const stripe = this.ensureConfigured();
    await stripe.paymentMethods.detach(paymentMethodId);
  }

  async listPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    const stripe = this.ensureConfigured();
    const { data } = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return data.map((pm) => ({
      id: pm.id,
      type: pm.type,
      last4: pm.card?.last4,
      brand: pm.card?.brand,
      expiryMonth: pm.card?.exp_month,
      expiryYear: pm.card?.exp_year,
      isDefault: false,
    }));
  }

  async setDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string,
  ): Promise<void> {
    const stripe = this.ensureConfigured();
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
  }

  async createSubscription(data: {
    customerId: string;
    planId: string;
    paymentMethodId?: string;
    trialDays?: number;
    metadata?: Record<string, any>;
  }): Promise<Subscription> {
    const stripe = this.ensureConfigured();
    const subscription = await stripe.subscriptions.create({
      customer: data.customerId,
      items: [{ price: data.planId }],
      default_payment_method: data.paymentMethodId,
      trial_period_days: data.trialDays,
      metadata: data.metadata,
    });

    return {
      id: subscription.id,
      customerId: subscription.customer as string,
      planId: data.planId,
      status: subscription.status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      amount: subscription.items.data[0].price.unit_amount || 0,
      currency: subscription.currency,
    };
  }

  async getSubscription(subscriptionId: string): Promise<Subscription> {
    const stripe = this.ensureConfigured();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    return {
      id: subscription.id,
      customerId: subscription.customer as string,
      planId: subscription.items.data[0].price.id,
      status: subscription.status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      amount: subscription.items.data[0].price.unit_amount || 0,
      currency: subscription.currency,
    };
  }

  async updateSubscription(
    subscriptionId: string,
    data: { planId?: string; metadata?: Record<string, any> },
  ): Promise<Subscription> {
    const stripe = this.ensureConfigured();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const updated = await stripe.subscriptions.update(subscriptionId, {
      items: data.planId
        ? [{ id: subscription.items.data[0].id, price: data.planId }]
        : undefined,
      metadata: data.metadata,
    });

    return {
      id: updated.id,
      customerId: updated.customer as string,
      planId: updated.items.data[0].price.id,
      status: updated.status as any,
      currentPeriodStart: new Date(updated.current_period_start * 1000),
      currentPeriodEnd: new Date(updated.current_period_end * 1000),
      cancelAtPeriodEnd: updated.cancel_at_period_end,
      amount: updated.items.data[0].price.unit_amount || 0,
      currency: updated.currency,
    };
  }

  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd = true,
  ): Promise<Subscription> {
    const stripe = this.ensureConfigured();
    const subscription = cancelAtPeriodEnd
      ? await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        })
      : await stripe.subscriptions.cancel(subscriptionId);

    return {
      id: subscription.id,
      customerId: subscription.customer as string,
      planId: subscription.items.data[0].price.id,
      status: subscription.status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      amount: subscription.items.data[0].price.unit_amount || 0,
      currency: subscription.currency,
    };
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    const stripe = this.ensureConfigured();
    const invoice = await stripe.invoices.retrieve(invoiceId);

    return {
      id: invoice.id,
      customerId: invoice.customer as string,
      subscriptionId: invoice.subscription as string | undefined,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: this.mapStripeInvoiceStatus(invoice.status),
      description: invoice.description || undefined,
      createdAt: new Date(invoice.created * 1000),
      paidAt: invoice.status_transitions.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : undefined,
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : undefined,
      invoiceNumber: invoice.number || invoice.id,
      pdfUrl: invoice.invoice_pdf || undefined,
    };
  }

  async listInvoices(customerId: string, limit = 100): Promise<Invoice[]> {
    const stripe = this.ensureConfigured();
    const { data } = await stripe.invoices.list({
      customer: customerId,
      limit,
    });

    return data.map((invoice) => ({
      id: invoice.id,
      customerId: invoice.customer as string,
      subscriptionId: invoice.subscription as string | undefined,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: this.mapStripeInvoiceStatus(invoice.status),
      description: invoice.description || undefined,
      createdAt: new Date(invoice.created * 1000),
      paidAt: invoice.status_transitions.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : undefined,
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : undefined,
      invoiceNumber: invoice.number || invoice.id,
      pdfUrl: invoice.invoice_pdf || undefined,
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
    const stripe = this.ensureConfigured();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: data.amount,
      currency: data.currency,
      customer: data.customerId,
      payment_method: data.paymentMethodId,
      description: data.description,
      metadata: data.metadata,
      confirm: !!data.paymentMethodId,
    });

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: this.mapStripePaymentStatus(paymentIntent.status),
      customerId: data.customerId,
      description: data.description,
      metadata: data.metadata,
      createdAt: new Date(paymentIntent.created * 1000),
    };
  }

  async capturePayment(paymentId: string): Promise<Payment> {
    const stripe = this.ensureConfigured();
    const paymentIntent = await stripe.paymentIntents.capture(paymentId);

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: this.mapStripePaymentStatus(paymentIntent.status),
      customerId: paymentIntent.customer as string,
      description: paymentIntent.description || undefined,
      metadata: paymentIntent.metadata,
      createdAt: new Date(paymentIntent.created * 1000),
    };
  }

  async createRefund(data: {
    paymentId: string;
    amount?: number;
    reason?: string;
  }): Promise<Refund> {
    const stripe = this.ensureConfigured();
    const refund = await stripe.refunds.create({
      payment_intent: data.paymentId,
      amount: data.amount,
      reason: data.reason as any,
    });

    return {
      id: refund.id,
      paymentId: data.paymentId,
      amount: refund.amount,
      currency: refund.currency,
      status: this.mapStripeRefundStatus(refund.status),
      reason: data.reason,
      createdAt: new Date(refund.created * 1000),
    };
  }

  async getRefund(refundId: string): Promise<Refund> {
    const stripe = this.ensureConfigured();
    const refund = await stripe.refunds.retrieve(refundId);

    return {
      id: refund.id,
      paymentId: refund.payment_intent as string,
      amount: refund.amount,
      currency: refund.currency,
      status: this.mapStripeRefundStatus(refund.status),
      reason: refund.reason || undefined,
      createdAt: new Date(refund.created * 1000),
    };
  }

  validateWebhook(payload: any, signature: string, secret: string): boolean {
    try {
      const stripe = this.ensureConfigured();
      stripe.webhooks.constructEvent(payload, signature, secret);
      return true;
    } catch {
      return false;
    }
  }

  parseWebhookEvent(payload: any): WebhookEvent {
    return {
      id: payload.id,
      type: payload.type,
      data: payload.data,
      provider: PaymentProvider.STRIPE,
      timestamp: new Date(payload.created * 1000),
    };
  }

  private mapStripeInvoiceStatus(status: string | null): PaymentStatus {
    switch (status) {
      case 'paid':
        return PaymentStatus.COMPLETED;
      case 'open':
      case 'draft':
        return PaymentStatus.PENDING;
      case 'uncollectible':
      case 'void':
        return PaymentStatus.FAILED;
      default:
        return PaymentStatus.PENDING;
    }
  }

  private mapStripePaymentStatus(status: string): PaymentStatus {
    switch (status) {
      case 'succeeded':
        return PaymentStatus.COMPLETED;
      case 'processing':
        return PaymentStatus.PROCESSING;
      case 'canceled':
        return PaymentStatus.CANCELLED;
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        return PaymentStatus.PENDING;
      default:
        return PaymentStatus.FAILED;
    }
  }

  private mapStripeRefundStatus(status: string | null): PaymentStatus {
    switch (status) {
      case 'succeeded':
        return PaymentStatus.REFUNDED;
      case 'pending':
        return PaymentStatus.PROCESSING;
      case 'failed':
      case 'canceled':
        return PaymentStatus.FAILED;
      default:
        return PaymentStatus.PROCESSING;
    }
  }
}
