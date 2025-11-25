import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService, AuditAction, AuditResource } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Audit')
@Controller('audit')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @ApiOperation({
    summary: 'Query audit logs',
    description: `
Retrieve audit logs with optional filters. Requires super_admin or org_admin role.

**Filters:**
- Date range (startDate, endDate)
- User ID
- Action type
- Resource type
- Success/failure status

**Use Cases:**
- Compliance reporting (SOC 2, GDPR)
- Security incident investigation
- User activity monitoring
- Data access auditing
    `,
  })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Filter by tenant ID (super_admin only)' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'action', required: false, enum: AuditAction, description: 'Filter by action type' })
  @ApiQuery({ name: 'resource', required: false, enum: AuditResource, description: 'Filter by resource type' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date (ISO 8601)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of records to return (default: 100, max: 1000)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of records to skip (pagination)' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        logs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              tenantId: { type: 'string' },
              action: { type: 'string' },
              resource: { type: 'string' },
              resourceId: { type: 'string' },
              changes: { type: 'object' },
              metadata: { type: 'object' },
              ipAddress: { type: 'string' },
              userAgent: { type: 'string' },
              success: { type: 'boolean' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
        total: { type: 'number' },
        limit: { type: 'number' },
        offset: { type: 'number' },
      },
    },
  })
  async getLogs(
    @Query('tenantId') tenantId?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: AuditAction,
    @Query('resource') resource?: AuditResource,
    @Query('resourceId') resourceId?: string,
    @Query('success') success?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Req() req?: any,
  ) {
    // TODO: Check if user has permission to view audit logs (super_admin or org_admin)
    // const user = req.user;
    // if (!hasPermission(user, 'audit.view')) {
    //   throw new ForbiddenException('Insufficient permissions to view audit logs');
    // }

    const filters = {
      tenantId,
      userId,
      action,
      resource,
      resourceId,
      success: success === 'true' ? true : success === 'false' ? false : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? Math.min(parseInt(limit, 10), 1000) : 100,
      offset: offset ? parseInt(offset, 10) : 0,
    };

    const logs = await this.auditService.query(filters);

    return {
      logs,
      total: logs.length, // TODO: Get actual total count from database
      limit: filters.limit,
      offset: filters.offset,
    };
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get audit statistics',
    description: `
Retrieve aggregated audit statistics for a tenant.

**Includes:**
- Total events
- Events by action type
- Events by resource type
- Failed login attempts
- Data exports
- Administrative actions

**Period Options:**
- day (last 24 hours)
- week (last 7 days)
- month (last 30 days)
    `,
  })
  @ApiQuery({ name: 'tenantId', required: true, description: 'Tenant ID' })
  @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month'], description: 'Time period for statistics' })
  @ApiResponse({
    status: 200,
    description: 'Audit statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['day', 'week', 'month'] },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        totalEvents: { type: 'number' },
        eventsByAction: {
          type: 'object',
          additionalProperties: { type: 'number' },
        },
        eventsByResource: {
          type: 'object',
          additionalProperties: { type: 'number' },
        },
        failedLogins: { type: 'number' },
        dataExports: { type: 'number' },
        adminActions: { type: 'number' },
      },
    },
  })
  async getStats(
    @Query('tenantId') tenantId: string,
    @Query('period') period: 'day' | 'week' | 'month' = 'month',
  ) {
    return this.auditService.getStats(tenantId, period);
  }

  @Get('export')
  @ApiOperation({
    summary: 'Export audit logs',
    description: `
Export audit logs in CSV or JSON format for compliance reporting.

**Use Cases:**
- SOC 2 compliance reports
- GDPR data access requests
- Security audits
- Forensic analysis
    `,
  })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Filter by tenant ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for export (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for export (ISO 8601)' })
  @ApiQuery({ name: 'format', required: false, enum: ['csv', 'json'], description: 'Export format (default: csv)' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs exported successfully',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
        },
      },
      'application/json': {
        schema: {
          type: 'string',
        },
      },
    },
  })
  async exportLogs(
    @Query('tenantId') tenantId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format: 'csv' | 'json' = 'csv',
    @Req() req?: any,
  ) {
    // TODO: Log this export action itself
    // await this.auditService.logExport(
    //   req.user.id,
    //   tenantId,
    //   AuditResource.SYSTEM,
    //   0, // Will be set after export
    //   format,
    //   req.ip,
    // );

    const filters = {
      tenantId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    return this.auditService.exportLogs(filters, format);
  }
}
