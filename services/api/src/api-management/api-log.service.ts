import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ApiLogQueryDto } from './dto/api-log-query.dto';

@Injectable()
export class ApiLogService {
  constructor(private prisma: PrismaService) {}

  /**
   * Log an API request
   */
  async logRequest(data: {
    tenantId: string;
    apiKeyId?: string;
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
    requestSize?: number;
    responseSize?: number;
    ipAddress: string;
    userAgent?: string;
    errorMessage?: string;
    metadata?: any;
  }) {
    return this.prisma.apiLog.create({ data });
  }

  /**
   * Query API logs with filters
   */
  async query(tenantId: string, query: ApiLogQueryDto) {
    const where: any = { tenantId };

    if (query.apiKeyId) {
      where.apiKeyId = query.apiKeyId;
    }

    if (query.endpoint) {
      where.endpoint = { contains: query.endpoint, mode: 'insensitive' };
    }

    if (query.method) {
      where.method = query.method.toUpperCase();
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.apiLog.findMany({
        where,
        orderBy: { createdAt: query.sort || 'desc' },
        skip: query.skip || 0,
        take: query.limit || 100,
        select: {
          id: true,
          endpoint: true,
          method: true,
          statusCode: true,
          responseTime: true,
          requestSize: true,
          responseSize: true,
          ipAddress: true,
          errorMessage: true,
          createdAt: true,
          apiKey: {
            select: {
              id: true,
              name: true,
              keyPrefix: true,
            }
          }
        }
      }),
      this.prisma.apiLog.count({ where })
    ]);

    return {
      logs,
      total,
      page: Math.floor((query.skip || 0) / (query.limit || 100)) + 1,
      pageSize: query.limit || 100,
      totalPages: Math.ceil(total / (query.limit || 100))
    };
  }

  /**
   * Get aggregated stats for a time period
   */
  async getStats(tenantId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where = {
      tenantId,
      createdAt: { gte: startDate }
    };

    const [total, successful, errors, avgTime, slowest] = await Promise.all([
      this.prisma.apiLog.count({ where }),
      this.prisma.apiLog.count({ where: { ...where, statusCode: { gte: 200, lt: 300 } } }),
      this.prisma.apiLog.count({ where: { ...where, statusCode: { gte: 400 } } }),
      this.prisma.apiLog.aggregate({
        where,
        _avg: { responseTime: true }
      }),
      this.prisma.apiLog.findMany({
        where,
        orderBy: { responseTime: 'desc' },
        take: 5,
        select: {
          endpoint: true,
          method: true,
          responseTime: true,
          createdAt: true,
        }
      })
    ]);

    // Get top endpoints
    const topEndpoints = await this.prisma.apiLog.groupBy({
      by: ['endpoint', 'method'],
      where,
      _count: true,
      orderBy: { _count: { endpoint: 'desc' } },
      take: 10
    });

    // Get status code distribution
    const statusCodes = await this.prisma.apiLog.groupBy({
      by: ['statusCode'],
      where,
      _count: true,
      orderBy: { statusCode: 'asc' }
    });

    return {
      total,
      successful,
      errors,
      errorRate: total > 0 ? (errors / total) * 100 : 0,
      avgResponseTime: Math.round(avgTime._avg.responseTime || 0),
      slowestRequests: slowest,
      topEndpoints: topEndpoints.map(e => ({
        endpoint: `${e.method} ${e.endpoint}`,
        count: e._count
      })),
      statusCodes: statusCodes.map(s => ({
        code: s.statusCode,
        count: s._count
      }))
    };
  }

  /**
   * Delete old logs (data retention)
   */
  async cleanupOldLogs(daysToKeep: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.prisma.apiLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate }
      }
    });

    return {
      deleted: result.count,
      cutoffDate: cutoffDate.toISOString()
    };
  }
}
