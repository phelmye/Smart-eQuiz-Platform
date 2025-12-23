import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { TenantGuard } from '../auth/tenant.guard';
import { TenantId } from '../common/tenant-id.decorator';
import { PaymentsService } from './payments.service';
import { PaymentGatewayService } from './payment-gateway.service';
import { PaymentProvider, PaymentStatus, TransactionType } from './payment-gateway.interface';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private paymentGateway: PaymentGatewayService,
  ) {}

  /**
   * Get configured payment gateways (for tenant selection)
   */
  @Get('gateways')
  @UseGuards(TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get configured payment gateways' })
  @ApiResponse({ status: 200, description: 'Returns available payment gateways' })
  async getGateways() {
    return this.paymentGateway.getGatewayStats();
  }

  /**
   * Get gateway info for a specific provider
   */
  @Get('gateways/:provider')
  @UseGuards(TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment gateway information' })
  @ApiResponse({ status: 200, description: 'Returns gateway details' })
  async getGatewayInfo(@Param('provider') provider: PaymentProvider) {
    return this.paymentGateway.getProviderInfo(provider);
  }

  /**
   * Get transactions for current tenant
   */
  @Get('transactions')
  @UseGuards(TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment transactions' })
  @ApiResponse({ status: 200, description: 'Returns transaction list' })
  async getTenantTransactions(
    @TenantId() tenantId: string,
    @Query('limit') limit?: number,
  ) {
    return this.paymentsService.getTenantTransactions(tenantId, limit);
  }

  /**
   * Get all transactions (super admin only)
   */
  @Get('admin/transactions')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all payment transactions (super admin)' })
  @ApiResponse({ status: 200, description: 'Returns all transactions' })
  async getAllTransactions(
    @Query('provider') provider?: PaymentProvider,
    @Query('status') status?: PaymentStatus,
    @Query('type') type?: TransactionType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
  ) {
    return this.paymentsService.getAllTransactions({
      provider,
      status,
      type,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit,
    });
  }

  /**
   * Get transaction by ID
   */
  @Get('transactions/:id')
  @UseGuards(TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get transaction details' })
  @ApiResponse({ status: 200, description: 'Returns transaction' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransaction(@Param('id') id: string) {
    return this.paymentsService.getTransaction(id);
  }

  /**
   * Get revenue statistics (super admin only)
   */
  @Get('admin/revenue-stats')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get revenue statistics (super admin)' })
  @ApiResponse({ status: 200, description: 'Returns revenue statistics' })
  async getRevenueStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.paymentsService.getRevenueStats({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  /**
   * Export transactions (super admin only)
   */
  @Get('admin/export')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export transactions (super admin)' })
  @ApiResponse({ status: 200, description: 'Returns transaction export data' })
  async exportTransactions(
    @Query('provider') provider?: PaymentProvider,
    @Query('status') status?: PaymentStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const transactions = await this.paymentsService.getAllTransactions({
      provider,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: 10000, // Large limit for export
    });

    return {
      data: transactions,
      exported_at: new Date().toISOString(),
      total_count: transactions.length,
    };
  }
}
