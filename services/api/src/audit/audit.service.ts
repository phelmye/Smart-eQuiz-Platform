import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export enum AuditAction {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  
  // Data operations
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  BULK_CREATE = 'BULK_CREATE',
  BULK_UPDATE = 'BULK_UPDATE',
  BULK_DELETE = 'BULK_DELETE',
  
  // Access
  ACCESS = 'ACCESS',
  ACCESS_DENIED = 'ACCESS_DENIED',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  
  // Administrative
  ROLE_CHANGE = 'ROLE_CHANGE',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  SETTINGS_CHANGE = 'SETTINGS_CHANGE',
  INTEGRATION_ENABLED = 'INTEGRATION_ENABLED',
  INTEGRATION_DISABLED = 'INTEGRATION_DISABLED',
  
  // Billing
  PLAN_CHANGE = 'PLAN_CHANGE',
  PAYMENT_METHOD_ADDED = 'PAYMENT_METHOD_ADDED',
  PAYMENT_METHOD_REMOVED = 'PAYMENT_METHOD_REMOVED',
  SUBSCRIPTION_UPDATED = 'SUBSCRIPTION_UPDATED',
  
  // System
  BACKUP_CREATED = 'BACKUP_CREATED',
  BACKUP_RESTORED = 'BACKUP_RESTORED',
  CONFIG_CHANGE = 'CONFIG_CHANGE',
}

export enum AuditResource {
  // Core entities
  USER = 'USER',
  TENANT = 'TENANT',
  ROLE = 'ROLE',
  PERMISSION = 'PERMISSION',
  
  // Quiz entities
  TOURNAMENT = 'TOURNAMENT',
  QUESTION = 'QUESTION',
  QUESTION_BANK = 'QUESTION_BANK',
  PARTICIPANT = 'PARTICIPANT',
  MATCH = 'MATCH',
  PRACTICE_SESSION = 'PRACTICE_SESSION',
  
  // Content
  MARKETING_CONTENT = 'MARKETING_CONTENT',
  BLOG_POST = 'BLOG_POST',
  MEDIA = 'MEDIA',
  
  // Settings
  BILLING = 'BILLING',
  SETTINGS = 'SETTINGS',
  INTEGRATION = 'INTEGRATION',
  
  // System
  SYSTEM = 'SYSTEM',
  BACKUP = 'BACKUP',
}

export interface AuditLogData {
  userId: string;
  tenantId?: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  errorMessage?: string;
}

export interface AuditLogFilters {
  tenantId?: string;
  userId?: string;
  action?: AuditAction;
  resource?: AuditResource;
  resourceId?: string;
  success?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new audit log entry
   */
  async log(data: AuditLogData): Promise<void> {
    try {
      // Create audit log entry in database
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          tenantId: data.tenantId,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          changes: data.changes as any,
          metadata: data.metadata as any,
          success: data.success ?? true,
          errorMsg: data.errorMessage,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      // Never throw errors from audit logging - it should be non-blocking
      console.error('[AUDIT ERROR]', error);
    }
  }

  /**
   * Log authentication event
   */
  async logAuth(
    action: AuditAction.LOGIN | AuditAction.LOGOUT | AuditAction.LOGIN_FAILED,
    userId: string,
    tenantId: string | undefined,
    ipAddress: string | undefined,
    userAgent: string | undefined,
    success: boolean = true,
    errorMessage?: string,
  ): Promise<void> {
    await this.log({
      userId,
      tenantId,
      action,
      resource: AuditResource.USER,
      resourceId: userId,
      ipAddress,
      userAgent,
      success,
      errorMessage,
    });
  }

  /**
   * Log data mutation (create/update/delete)
   */
  async logMutation(
    action: AuditAction.CREATE | AuditAction.UPDATE | AuditAction.DELETE,
    userId: string,
    tenantId: string | undefined,
    resource: AuditResource,
    resourceId: string,
    changes?: { before?: any; after?: any },
    ipAddress?: string,
  ): Promise<void> {
    await this.log({
      userId,
      tenantId,
      action,
      resource,
      resourceId,
      changes,
      ipAddress,
    });
  }

  /**
   * Log access to sensitive data
   */
  async logAccess(
    userId: string,
    tenantId: string | undefined,
    resource: AuditResource,
    resourceId: string,
    granted: boolean,
    ipAddress?: string,
  ): Promise<void> {
    await this.log({
      userId,
      tenantId,
      action: granted ? AuditAction.ACCESS : AuditAction.ACCESS_DENIED,
      resource,
      resourceId,
      ipAddress,
      success: granted,
    });
  }

  /**
   * Log administrative action
   */
  async logAdmin(
    action: AuditAction,
    userId: string,
    tenantId: string | undefined,
    resource: AuditResource,
    resourceId: string,
    changes?: Record<string, any>,
    ipAddress?: string,
  ): Promise<void> {
    await this.log({
      userId,
      tenantId,
      action,
      resource,
      resourceId,
      changes,
      ipAddress,
      metadata: { adminAction: true },
    });
  }

  /**
   * Log data export
   */
  async logExport(
    userId: string,
    tenantId: string | undefined,
    resource: AuditResource,
    recordCount: number,
    format: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.log({
      userId,
      tenantId,
      action: AuditAction.EXPORT,
      resource,
      metadata: {
        recordCount,
        format,
        exportedAt: new Date(),
      },
      ipAddress,
    });
  }

  /**
   * Query audit logs (for compliance reporting)
   */
  async query(filters: AuditLogFilters): Promise<any[]> {
    const where: any = {};
    
    if (filters.tenantId) where.tenantId = filters.tenantId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.resource) where.resource = filters.resource;
    if (filters.resourceId) where.resourceId = filters.resourceId;
    if (filters.success !== undefined) where.success = filters.success;
    
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 100,
      skip: filters.offset || 0,
    });
  }

  /**
   * Get audit statistics for a tenant
   */
  async getStats(tenantId: string, period: 'day' | 'week' | 'month' = 'month'): Promise<any> {
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    // Get all logs for the period
    const logs = await this.prisma.auditLog.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
    });

    // Calculate statistics
    const totalEvents = logs.length;
    const eventsByAction: Record<string, number> = {};
    const eventsByResource: Record<string, number> = {};
    let failedLogins = 0;
    let dataExports = 0;
    let adminActions = 0;

    for (const log of logs) {
      // Count by action
      eventsByAction[log.action] = (eventsByAction[log.action] || 0) + 1;
      
      // Count by resource
      eventsByResource[log.resource] = (eventsByResource[log.resource] || 0) + 1;
      
      // Count specific action types
      if (log.action === AuditAction.LOGIN_FAILED) failedLogins++;
      if (log.action === AuditAction.EXPORT) dataExports++;
      if (log.metadata && (log.metadata as any).adminAction) adminActions++;
    }

    return {
      period,
      startDate,
      endDate: now,
      totalEvents,
      eventsByAction,
      eventsByResource,
      failedLogins,
      dataExports,
      adminActions,
    };
  }

  /**
   * Export audit logs for compliance (CSV format)
   */
  async exportLogs(
    filters: AuditLogFilters,
    format: 'csv' | 'json' = 'csv',
  ): Promise<string> {
    const logs = await this.query(filters);
    
    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }

    // CSV format
    const headers = [
      'Timestamp',
      'User ID',
      'Tenant ID',
      'Action',
      'Resource',
      'Resource ID',
      'Success',
      'IP Address',
    ];

    const rows = logs.map(log => [
      log.timestamp,
      log.userId,
      log.tenantId || '',
      log.action,
      log.resource,
      log.resourceId || '',
      log.success ? 'Yes' : 'No',
      log.ipAddress || '',
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}
