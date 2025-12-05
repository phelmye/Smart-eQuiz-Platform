import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Headers,
  RawBodyRequest,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import {
  CreateCustomerDto,
  CreateSubscriptionDto,
  AttachPaymentMethodDto,
} from './dto';

@ApiTags('Payments')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('customers')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createCustomer(
    @Body() dto: CreateCustomerDto,
    @TenantId() tenantId: string,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const customer = await this.stripeService.createCustomer(dto, tenantId, userId);
    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
    };
  }

  @Get('customers/:customerId')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a Stripe customer' })
  @ApiResponse({ status: 200, description: 'Customer retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCustomer(@Param('customerId') customerId: string) {
    const customer = await this.stripeService.getCustomer(customerId);
    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
    };
  }

  @Post('payment-methods/attach')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Attach payment method to customer' })
  @ApiResponse({ status: 200, description: 'Payment method attached successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async attachPaymentMethod(
    @Body() dto: AttachPaymentMethodDto,
    @TenantId() tenantId: string,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const paymentMethod = await this.stripeService.attachPaymentMethod(dto, tenantId, userId);
    return {
      id: paymentMethod.id,
      type: paymentMethod.type,
      card: paymentMethod.card,
    };
  }

  @Post('subscriptions')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a subscription' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createSubscription(
    @Body() dto: CreateSubscriptionDto,
    @TenantId() tenantId: string,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const subscription = await this.stripeService.createSubscription(dto, tenantId, userId);
    return {
      id: subscription.id,
      status: subscription.status,
      current_period_end: subscription.current_period_end,
    };
  }

  @Get('subscriptions/:subscriptionId')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a subscription' })
  @ApiResponse({ status: 200, description: 'Subscription retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSubscription(@Param('subscriptionId') subscriptionId: string) {
    const subscription = await this.stripeService.getSubscription(subscriptionId);
    return {
      id: subscription.id,
      status: subscription.status,
      current_period_end: subscription.current_period_end,
    };
  }

  @Delete('subscriptions/:subscriptionId')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a subscription' })
  @ApiResponse({ status: 200, description: 'Subscription canceled successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async cancelSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @TenantId() tenantId: string,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const subscription = await this.stripeService.cancelSubscription(subscriptionId, tenantId, userId);
    return {
      id: subscription.id,
      status: subscription.status,
    };
  }

  @Post('billing-portal')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create billing portal session' })
  @ApiResponse({ status: 200, description: 'Session created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createBillingPortalSession(
    @Body() body: { customerId: string; returnUrl: string },
  ) {
    const session = await this.stripeService.createBillingPortalSession(
      body.customerId,
      body.returnUrl,
    );
    return { url: session.url };
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create checkout session' })
  @ApiResponse({ status: 200, description: 'Session created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createCheckoutSession(
    @Body() body: { priceId: string; customerId: string; successUrl: string; cancelUrl: string },
    @TenantId() tenantId: string,
  ) {
    const session = await this.stripeService.createCheckoutSession(
      body.priceId,
      body.customerId,
      body.successUrl,
      body.cancelUrl,
      tenantId,
    );
    return { url: session.url, sessionId: session.id };
  }

  @Post('webhooks')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid signature' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const payload = req.rawBody;
    await this.stripeService.handleWebhook(signature, payload);
    return { received: true };
  }
}
