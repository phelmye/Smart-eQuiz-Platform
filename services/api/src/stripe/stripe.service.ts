import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma.service';
import { AuditService, AuditAction, AuditResource } from '../audit/audit.service';
import { AnalyticsTrackingService } from '../analytics/analytics-tracking.service';
import {
  CreateCustomerDto,
  CreateSubscriptionDto,
  AttachPaymentMethodDto,
} from './dto';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private auditService: AuditService,
    private analyticsTracking: AnalyticsTrackingService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      this.logger.warn('STRIPE_SECRET_KEY not configured - payment features disabled');
      // Don't throw error, allow app to start without Stripe
    } else {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2023-10-16',
      });
    }
  }

  /**
   * Create a Stripe customer
   */
  async createCustomer(dto: CreateCustomerDto, tenantId: string, userId: string): Promise<Stripe.Customer> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      const customer = await this.stripe.customers.create({
        email: dto.email,
        name: dto.name,
        phone: dto.phone,
        metadata: {
          ...dto.metadata,
          tenantId,
          userId,
        },
      });

      // Log audit event
      await this.auditService.log({
        tenantId,
        userId,
        action: AuditAction.PAYMENT_METHOD_ADDED,
        resource: AuditResource.USER,
        resourceId: customer.id,
        metadata: { email: dto.email, name: dto.name },
      });

      this.logger.log(`Created Stripe customer ${customer.id} for user ${userId}`);
      return customer;
    } catch (error) {
      this.logger.error(`Failed to create Stripe customer: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create customer');
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      if (customer.deleted) {
        throw new BadRequestException('Customer has been deleted');
      }
      return customer as Stripe.Customer;
    } catch (error) {
      this.logger.error(`Failed to retrieve customer ${customerId}: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve customer');
    }
  }

  /**
   * Attach payment method to customer
   */
  async attachPaymentMethod(dto: AttachPaymentMethodDto, tenantId: string, userId: string): Promise<Stripe.PaymentMethod> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(dto.paymentMethodId, {
        customer: dto.customerId,
      });

      // Set as default payment method
      await this.stripe.customers.update(dto.customerId, {
        invoice_settings: {
          default_payment_method: dto.paymentMethodId,
        },
      });

      // Log audit event
      await this.auditService.log({
        tenantId,
        userId,
        action: AuditAction.PAYMENT_METHOD_ADDED,
        resource: AuditResource.USER,
        resourceId: paymentMethod.id,
        metadata: { customerId: dto.customerId, type: paymentMethod.type },
      });

      this.logger.log(`Attached payment method ${paymentMethod.id} to customer ${dto.customerId}`);
      return paymentMethod;
    } catch (error) {
      this.logger.error(`Failed to attach payment method: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to attach payment method');
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(dto: CreateSubscriptionDto, tenantId: string, userId: string): Promise<Stripe.Subscription> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer: dto.customerId,
        items: [{ price: dto.priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      };

      if (dto.trialPeriodDays) {
        subscriptionParams.trial_period_days = dto.trialPeriodDays;
      }

      if (dto.paymentMethodId) {
        subscriptionParams.default_payment_method = dto.paymentMethodId;
      }

      const subscription = await this.stripe.subscriptions.create(subscriptionParams);

      // Update tenant with subscription info
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          stripeCustomerId: dto.customerId,
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
        },
      });

      // Log audit event
      await this.auditService.log({
        tenantId,
        userId,
        action: AuditAction.SUBSCRIPTION_UPDATED,
        resource: AuditResource.TENANT,
        resourceId: subscription.id,
        metadata: { priceId: dto.priceId, status: subscription.status },
      });

      // Track payment conversion in analytics (only if subscription is active/trialing)
      if (subscription.status === 'active' || subscription.status === 'trialing') {
        const amount = typeof subscription.items.data[0]?.price?.unit_amount === 'number'
          ? subscription.items.data[0].price.unit_amount / 100
          : 0;
        const currency = subscription.items.data[0]?.price?.currency || 'usd';

        await this.analyticsTracking.trackPaymentConversion({
          userId,
          tenantId,
          amount,
          currency,
          planId: dto.priceId,
          subscriptionId: subscription.id,
        }).catch(err => this.logger.warn('Failed to track payment conversion', err));
      }

      this.logger.log(`Created subscription ${subscription.id} for tenant ${tenantId}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to create subscription: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create subscription');
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, tenantId: string, userId: string): Promise<Stripe.Subscription> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      const subscription = await this.stripe.subscriptions.cancel(subscriptionId);

      // Update tenant
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          subscriptionStatus: subscription.status,
        },
      });

      // Log audit event
      await this.auditService.log({
        tenantId,
        userId,
        action: AuditAction.SUBSCRIPTION_UPDATED,
        resource: AuditResource.TENANT,
        resourceId: subscription.id,
        metadata: { status: 'canceled' },
      });

      this.logger.log(`Canceled subscription ${subscriptionId} for tenant ${tenantId}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to cancel subscription: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to cancel subscription');
    }
  }

  /**
   * Get subscription
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      this.logger.error(`Failed to retrieve subscription ${subscriptionId}: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve subscription');
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(signature: string, payload: Buffer): Promise<void> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      this.logger.warn('STRIPE_WEBHOOK_SECRET not configured - webhook validation disabled');
      return;
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${error.message}`);
      throw new BadRequestException('Invalid signature');
    }

    this.logger.log(`Received webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        this.logger.log(`Unhandled webhook event type: ${event.type}`);
    }
  }

  /**
   * Handle subscription update webhook
   */
  private async handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
    const customerId = typeof subscription.customer === 'string' 
      ? subscription.customer 
      : subscription.customer.id;

    const tenant = await this.prisma.tenant.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!tenant) {
      this.logger.warn(`No tenant found for customer ${customerId}`);
      return;
    }

    await this.prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
      },
    });

    this.logger.log(`Updated subscription ${subscription.id} for tenant ${tenant.id}`);
  }

  /**
   * Handle subscription deleted webhook
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const customerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

    const tenant = await this.prisma.tenant.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!tenant) {
      this.logger.warn(`No tenant found for customer ${customerId}`);
      return;
    }

    await this.prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        subscriptionStatus: 'canceled',
      },
    });

    this.logger.log(`Deleted subscription ${subscription.id} for tenant ${tenant.id}`);
  }

  /**
   * Handle payment succeeded webhook
   */
  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const customerId = typeof invoice.customer === 'string'
      ? invoice.customer
      : invoice.customer?.id;

    if (!customerId) {
      this.logger.warn('No customer ID in invoice');
      return;
    }

    const tenant = await this.prisma.tenant.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!tenant) {
      this.logger.warn(`No tenant found for customer ${customerId}`);
      return;
    }

    this.logger.log(`Payment succeeded for invoice ${invoice.id}, tenant ${tenant.id}`);
  }

  /**
   * Handle payment failed webhook
   */
  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId = typeof invoice.customer === 'string'
      ? invoice.customer
      : invoice.customer?.id;

    if (!customerId) {
      this.logger.warn('No customer ID in invoice');
      return;
    }

    const tenant = await this.prisma.tenant.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!tenant) {
      this.logger.warn(`No tenant found for customer ${customerId}`);
      return;
    }

    this.logger.warn(`Payment failed for invoice ${invoice.id}, tenant ${tenant.id}`);
  }

  /**
   * Create billing portal session
   */
  async createBillingPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return session;
    } catch (error) {
      this.logger.error(`Failed to create billing portal session: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create billing portal session');
    }
  }

  /**
   * Create checkout session for new subscription
   */
  async createCheckoutSession(
    priceId: string,
    customerId: string,
    successUrl: string,
    cancelUrl: string,
    tenantId: string,
  ): Promise<Stripe.Checkout.Session> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          tenantId,
        },
      });

      return session;
    } catch (error) {
      this.logger.error(`Failed to create checkout session: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create checkout session');
    }
  }
}
