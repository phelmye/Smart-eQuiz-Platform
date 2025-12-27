import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService, AuditAction, AuditResource } from '../audit/audit.service';
import { PaymentGatewayService } from './payment-gateway.service';
import { PaymentProvider, PaymentStatus, TransactionType } from './payment-gateway.interface';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private paymentGateway: PaymentGatewayService,
  ) {}

  /**
   * Get all transactions (super admin only)
   */
  async getAllTransactions(filters?: {
    provider?: PaymentProvider;
    status?: PaymentStatus;
    type?: TransactionType;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    const where: any = {};

    if (filters?.provider) {
      where.provider = filters.provider;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const transactions = await this.prisma.paymentTransaction.findMany({
      where,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100,
    });

    return transactions;
  }

  /**
   * Get transactions for a specific tenant
   */
  async getTenantTransactions(tenantId: string, limit = 50) {
    const transactions = await this.prisma.paymentTransaction.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return transactions;
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string, tenantId?: string) {
    const where: any = { id: transactionId };
    
    // If tenantId provided (non-super-admin), filter by tenant
    if (tenantId) {
      where.tenantId = tenantId;
    }
    
    const transaction = await this.prisma.paymentTransaction.findFirst({
      where,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found or access denied');
    }

    return transaction;
  }

  /**
   * Get revenue statistics
   */
  async getRevenueStats(filters?: { startDate?: Date; endDate?: Date }) {
    const where: any = {
      status: PaymentStatus.COMPLETED,
      type: TransactionType.SUBSCRIPTION,
    };

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [totalRevenue, transactionCount, byProvider] = await Promise.all([
      // Total revenue
      this.prisma.paymentTransaction.aggregate({
        where,
        _sum: { amount: true },
      }),

      // Transaction count
      this.prisma.paymentTransaction.count({ where }),

      // Revenue by provider
      this.prisma.paymentTransaction.groupBy({
        by: ['provider'],
        where,
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    // MRR calculation (last 30 days of subscription payments)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const mrrData = await this.prisma.paymentTransaction.aggregate({
      where: {
        status: PaymentStatus.COMPLETED,
        type: TransactionType.SUBSCRIPTION,
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { amount: true },
    });

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      transactionCount,
      mrr: mrrData._sum.amount || 0,
      byProvider: byProvider.map((p) => ({
        provider: p.provider,
        revenue: p._sum.amount || 0,
        count: p._count,
      })),
    };
  }

  /**
   * Get configured payment gateways
   */
  async getConfiguredGateways() {
    return this.paymentGateway.getGatewayStats();
  }

  /**
   * Create payment transaction record
   */
  async createTransaction(data: {
    tenantId: string;
    provider: PaymentProvider;
    providerTransactionId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    type: TransactionType;
    description?: string;
    metadata?: any;
  }) {
    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        tenantId: data.tenantId,
        provider: data.provider,
        providerTransactionId: data.providerTransactionId,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        type: data.type,
        description: data.description,
        metadata: data.metadata,
      },
    });

    // Log audit event (using UPDATE action since PAYMENT_PROCESSED doesn't exist yet)
    await this.auditService.log({
      tenantId: data.tenantId,
      userId: null,
      action: AuditAction.UPDATE,
      resource: AuditResource.TENANT,
      resourceId: transaction.id,
      metadata: {
        action: 'payment_processed',
        provider: data.provider,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
      },
    });

    return transaction;
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    transactionId: string,
    status: PaymentStatus,
    metadata?: any,
  ) {
    const transaction = await this.prisma.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        status,
        metadata: metadata
          ? {
              ...((await this.prisma.paymentTransaction.findUnique({
                where: { id: transactionId },
              }))?.metadata as any),
              ...metadata,
            }
          : undefined,
      },
    });

    return transaction;
  }
}
