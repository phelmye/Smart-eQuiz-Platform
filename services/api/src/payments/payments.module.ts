import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma.module';
import { AuditModule } from '../audit/audit.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { PaymentGatewayService } from './payment-gateway.service';
import { StripeGateway } from './gateways/stripe.gateway';
import { PayPalGateway } from './gateways/paypal.gateway';
import { PayoneerGateway } from './gateways/payoneer.gateway';
import { WorldFirstGateway } from './gateways/worldfirst.gateway';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [ConfigModule, PrismaModule, AuditModule, AnalyticsModule],
  controllers: [PaymentsController],
  providers: [
    PaymentGatewayService,
    StripeGateway,
    PayPalGateway,
    PayoneerGateway,
    WorldFirstGateway,
    PaymentsService,
  ],
  exports: [PaymentGatewayService, PaymentsService],
})
export class PaymentsModule {}
