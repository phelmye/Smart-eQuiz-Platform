import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPaymentGateway, PaymentProvider } from './payment-gateway.interface';
import { StripeGateway } from './gateways/stripe.gateway';
import { PayPalGateway } from './gateways/paypal.gateway';
import { PayoneerGateway } from './gateways/payoneer.gateway';
import { WorldFirstGateway } from './gateways/worldfirst.gateway';

/**
 * Payment Gateway Factory Service
 * Manages multiple payment providers and routes requests to appropriate gateway
 */
@Injectable()
export class PaymentGatewayService {
  private readonly gateways: Map<PaymentProvider, IPaymentGateway>;
  private readonly logger = new Logger(PaymentGatewayService.name);
  private readonly defaultProvider: PaymentProvider;

  constructor(
    private configService: ConfigService,
    private stripeGateway: StripeGateway,
    private paypalGateway: PayPalGateway,
    private payoneerGateway: PayoneerGateway,
    private worldfirstGateway: WorldFirstGateway,
  ) {
    // Initialize gateway map with explicit typing
    this.gateways = new Map<PaymentProvider, IPaymentGateway>([
      [PaymentProvider.STRIPE, stripeGateway],
      [PaymentProvider.PAYPAL, paypalGateway],
      [PaymentProvider.PAYONEER, payoneerGateway],
      [PaymentProvider.WORLDFIRST, worldfirstGateway],
    ]);

    // Set default provider from config or fallback to Stripe
    const configuredDefault = this.configService.get<string>('DEFAULT_PAYMENT_PROVIDER');
    this.defaultProvider = (configuredDefault as PaymentProvider) || PaymentProvider.STRIPE;

    this.logGatewayStatus();
  }

  /**
   * Get a specific payment gateway
   */
  getGateway(provider: PaymentProvider): IPaymentGateway {
    const gateway = this.gateways.get(provider);
    if (!gateway) {
      throw new Error(`Payment gateway ${provider} not found`);
    }
    if (!gateway.isConfigured()) {
      throw new Error(`Payment gateway ${provider} is not configured`);
    }
    return gateway;
  }

  /**
   * Get the default payment gateway
   */
  getDefaultGateway(): IPaymentGateway {
    return this.getGateway(this.defaultProvider);
  }

  /**
   * Get all configured gateways
   */
  getConfiguredGateways(): PaymentProvider[] {
    const configured: PaymentProvider[] = [];
    for (const [provider, gateway] of this.gateways.entries()) {
      if (gateway.isConfigured()) {
        configured.push(provider);
      }
    }
    return configured;
  }

  /**
   * Check if a specific gateway is configured
   */
  isGatewayConfigured(provider: PaymentProvider): boolean {
    const gateway = this.gateways.get(provider);
    return gateway ? gateway.isConfigured() : false;
  }

  /**
   * Get gateway by tenant preference (fallback to default)
   */
  getGatewayForTenant(tenantProvider?: PaymentProvider): IPaymentGateway {
    if (tenantProvider && this.isGatewayConfigured(tenantProvider)) {
      return this.getGateway(tenantProvider);
    }
    return this.getDefaultGateway();
  }

  /**
   * Get recommended gateway for a currency
   */
  getRecommendedGatewayForCurrency(currency: string): PaymentProvider {
    const upperCurrency = currency.toUpperCase();

    // Stripe - Best for USD, EUR, GBP (global)
    if (['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(upperCurrency)) {
      if (this.isGatewayConfigured(PaymentProvider.STRIPE)) {
        return PaymentProvider.STRIPE;
      }
    }

    // PayPal - Good for international payments
    if (this.isGatewayConfigured(PaymentProvider.PAYPAL)) {
      return PaymentProvider.PAYPAL;
    }

    // WorldFirst - Best for multi-currency and FX
    if (['CNY', 'JPY', 'HKD', 'SGD'].includes(upperCurrency)) {
      if (this.isGatewayConfigured(PaymentProvider.WORLDFIRST)) {
        return PaymentProvider.WORLDFIRST;
      }
    }

    // Payoneer - Good for emerging markets
    if (['INR', 'BRL', 'MXN', 'ZAR', 'NGN', 'KES'].includes(upperCurrency)) {
      if (this.isGatewayConfigured(PaymentProvider.PAYONEER)) {
        return PaymentProvider.PAYONEER;
      }
    }

    // Fallback to default
    return this.defaultProvider;
  }

  /**
   * Get payment provider info for display
   */
  getProviderInfo(provider: PaymentProvider) {
    const info = {
      [PaymentProvider.STRIPE]: {
        name: 'Stripe',
        description: 'Industry-leading payment processor',
        logo: '/assets/logos/stripe.svg',
        supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK'],
        features: ['Credit Cards', 'Debit Cards', 'ACH', 'SEPA', 'Subscriptions', 'Invoices'],
        fees: 'Starting at 2.9% + $0.30 per transaction',
      },
      [PaymentProvider.PAYPAL]: {
        name: 'PayPal',
        description: 'Global payment platform',
        logo: '/assets/logos/paypal.svg',
        supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'BRL', 'MXN'],
        features: ['PayPal Balance', 'Credit Cards', 'Debit Cards', 'Bank Transfer', 'Subscriptions'],
        fees: '2.9% + $0.30 per transaction',
      },
      [PaymentProvider.PAYONEER]: {
        name: 'Payoneer',
        description: 'Global payment solution for businesses',
        logo: '/assets/logos/payoneer.svg',
        supportedCurrencies: ['USD', 'EUR', 'GBP', 'INR', 'CNY', 'JPY', 'BRL', 'MXN', 'ZAR', 'NGN', 'KES'],
        features: ['Bank Transfer', 'Local Payments', 'Multi-Currency', 'Cross-Border'],
        fees: 'Up to 3% per transaction',
      },
      [PaymentProvider.WORLDFIRST]: {
        name: 'WorldFirst',
        description: 'International payments and currency exchange',
        logo: '/assets/logos/worldfirst.svg',
        supportedCurrencies: ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'HKD', 'SGD', 'AUD', 'CAD', 'NZD'],
        features: ['Currency Exchange', 'International Transfer', 'Multi-Currency Accounts', 'Hedging'],
        fees: 'Competitive FX rates, transparent fees',
      },
    };

    return info[provider];
  }

  /**
   * Log status of all gateways
   */
  private logGatewayStatus() {
    this.logger.log('Payment Gateway Status:');
    for (const [provider, gateway] of this.gateways.entries()) {
      const status = gateway.isConfigured() ? '✅ Configured' : '❌ Not Configured';
      this.logger.log(`  ${provider}: ${status}`);
    }
    this.logger.log(`Default provider: ${this.defaultProvider}`);
  }

  /**
   * Get gateway statistics for admin dashboard
   */
  getGatewayStats() {
    return {
      totalGateways: this.gateways.size,
      configuredGateways: this.getConfiguredGateways().length,
      defaultProvider: this.defaultProvider,
      gateways: Array.from(this.gateways.keys()).map((provider) => ({
        provider,
        configured: this.isGatewayConfigured(provider),
        info: this.getProviderInfo(provider),
      })),
    };
  }
}
