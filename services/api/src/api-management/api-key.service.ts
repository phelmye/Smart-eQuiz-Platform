import { Injectable, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { RevokeApiKeyDto } from './dto/revoke-api-key.dto';
import { ApiKeyStatus, ApiKeyType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a new API key with proper format
   * Format: api_{type}_{env}_{random}
   * Example: api_pub_live_abc123xyz or api_sec_live_xyz789abc
   */
  private generateApiKey(type: ApiKeyType): { key: string; prefix: string } {
    const typePrefix = type === ApiKeyType.PUBLIC ? 'pub' : type === ApiKeyType.SECRET ? 'sec' : 'test';
    const env = process.env.NODE_ENV === 'production' ? 'live' : 'test';
    const randomPart = crypto.randomBytes(24).toString('base64url');
    
    const key = `api_${typePrefix}_${env}_${randomPart}`;
    const prefix = key.substring(0, 20); // First 20 chars for identification
    
    return { key, prefix };
  }

  /**
   * Create a new API key for a tenant
   */
  async create(tenantId: string, userId: string, dto: CreateApiKeyDto) {
    const { key, prefix } = this.generateApiKey(dto.type || ApiKeyType.SECRET);
    const keyHash = await bcrypt.hash(key, 10);

    const apiKey = await this.prisma.apiKey.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        keyHash,
        keyPrefix: prefix,
        type: dto.type || ApiKeyType.SECRET,
        scopes: dto.scopes || [],
        rateLimit: dto.rateLimit || 60,
        ipWhitelist: dto.ipWhitelist || [],
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        createdBy: userId,
      },
      include: {
        tenant: {
          select: { id: true, name: true }
        }
      }
    });

    // Return the full key ONLY once at creation
    return {
      ...apiKey,
      key, // Full key shown only here
      keyHash: undefined, // Don't expose hash
    };
  }

  /**
   * List all API keys for a tenant (without exposing actual keys)
   */
  async findAll(tenantId: string) {
    const apiKeys = await this.prisma.apiKey.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        description: true,
        keyPrefix: true,
        type: true,
        status: true,
        scopes: true,
        rateLimit: true,
        ipWhitelist: true,
        lastUsedAt: true,
        lastUsedIp: true,
        expiresAt: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return apiKeys;
  }

  /**
   * Get single API key details
   */
  async findOne(tenantId: string, id: string) {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        name: true,
        description: true,
        keyPrefix: true,
        type: true,
        status: true,
        scopes: true,
        rateLimit: true,
        ipWhitelist: true,
        lastUsedAt: true,
        lastUsedIp: true,
        expiresAt: true,
        createdBy: true,
        revokedBy: true,
        revokedAt: true,
        revokedReason: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    return apiKey;
  }

  /**
   * Update API key settings
   */
  async update(tenantId: string, id: string, dto: UpdateApiKeyDto) {
    const existing = await this.prisma.apiKey.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      throw new NotFoundException('API key not found');
    }

    if (existing.status === ApiKeyStatus.REVOKED) {
      throw new ForbiddenException('Cannot update revoked API key');
    }

    return this.prisma.apiKey.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        name: true,
        description: true,
        keyPrefix: true,
        type: true,
        status: true,
        scopes: true,
        rateLimit: true,
        ipWhitelist: true,
        updatedAt: true,
      }
    });
  }

  /**
   * Revoke an API key
   */
  async revoke(tenantId: string, id: string, userId: string, dto: RevokeApiKeyDto) {
    const existing = await this.prisma.apiKey.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      throw new NotFoundException('API key not found');
    }

    if (existing.status === ApiKeyStatus.REVOKED) {
      throw new ForbiddenException('API key already revoked');
    }

    return this.prisma.apiKey.update({
      where: { id },
      data: {
        status: ApiKeyStatus.REVOKED,
        revokedBy: userId,
        revokedAt: new Date(),
        revokedReason: dto.reason,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        status: true,
        revokedAt: true,
        revokedReason: true,
      }
    });
  }

  /**
   * Delete an API key permanently
   */
  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.apiKey.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      throw new NotFoundException('API key not found');
    }

    await this.prisma.apiKey.delete({ where: { id } });
    return { message: 'API key deleted successfully' };
  }

  /**
   * Validate API key and return tenant context
   * Used by ApiKeyGuard
   */
  async validateApiKey(key: string, ipAddress?: string): Promise<any> {
    // Extract prefix from key
    const prefix = key.substring(0, 20);

    // Find key by prefix first (faster than bcrypt on all)
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { 
        keyPrefix: prefix,
        status: ApiKeyStatus.ACTIVE
      },
      include: {
        tenant: true
      }
    });

    if (!apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Verify hash
    const isValid = await bcrypt.compare(key, apiKey.keyHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Check expiration
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      throw new UnauthorizedException('API key has expired');
    }

    // Check IP whitelist
    if (apiKey.ipWhitelist.length > 0 && ipAddress) {
      if (!apiKey.ipWhitelist.includes(ipAddress)) {
        throw new UnauthorizedException('IP address not whitelisted');
      }
    }

    // Update last used
    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: {
        lastUsedAt: new Date(),
        lastUsedIp: ipAddress,
      }
    });

    return {
      apiKeyId: apiKey.id,
      tenantId: apiKey.tenantId,
      tenant: apiKey.tenant,
      scopes: apiKey.scopes,
      rateLimit: apiKey.rateLimit,
      type: apiKey.type,
    };
  }

  /**
   * Check if API key has required scope
   */
  hasScope(scopes: string[], requiredScope: string): boolean {
    // admin:full grants all permissions
    if (scopes.includes('admin:full')) {
      return true;
    }

    // Check exact match
    if (scopes.includes(requiredScope)) {
      return true;
    }

    // Check wildcard (e.g., 'users:*' matches 'users:read')
    const [resource, action] = requiredScope.split(':');
    const wildcardScope = `${resource}:*`;
    
    return scopes.includes(wildcardScope);
  }

  /**
   * Get API usage statistics for a tenant
   */
  async getUsageStats(tenantId: string, apiKeyId?: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: any = {
      tenantId,
      createdAt: { gte: startDate }
    };

    if (apiKeyId) {
      where.apiKeyId = apiKeyId;
    }

    const [totalRequests, successfulRequests, failedRequests, avgResponseTime] = await Promise.all([
      this.prisma.apiLog.count({ where }),
      this.prisma.apiLog.count({ where: { ...where, statusCode: { gte: 200, lt: 300 } } }),
      this.prisma.apiLog.count({ where: { ...where, statusCode: { gte: 400 } } }),
      this.prisma.apiLog.aggregate({
        where,
        _avg: { responseTime: true }
      })
    ]);

    // Get requests by endpoint
    const byEndpoint = await this.prisma.apiLog.groupBy({
      by: ['endpoint'],
      where,
      _count: true,
      orderBy: { _count: { endpoint: 'desc' } },
      take: 10
    });

    // Get requests over time (daily breakdown)
    const byDate = await this.prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM api_logs
      WHERE tenant_id = ${tenantId}
        AND created_at >= ${startDate}
        ${apiKeyId ? this.prisma.$queryRaw`AND api_key_id = ${apiKeyId}` : this.prisma.$queryRaw``}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      errorRate: totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0,
      avgResponseTime: Math.round(avgResponseTime._avg.responseTime || 0),
      byEndpoint: byEndpoint.map(e => ({
        endpoint: e.endpoint,
        count: e._count
      })),
      byDate
    };
  }
}
