import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeyService } from '../api-key.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private apiKeyService: ApiKeyService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Check for API key in header
    const apiKey = this.extractApiKey(request);
    
    if (!apiKey) {
      throw new UnauthorizedException('API key required');
    }

    // Get client IP
    const ipAddress = request.ip || request.connection.remoteAddress;

    // Validate API key
    const apiKeyContext = await this.apiKeyService.validateApiKey(apiKey, ipAddress);

    // Attach to request for later use
    request.apiKey = apiKeyContext;
    request.tenant = apiKeyContext.tenant;
    request.tenantId = apiKeyContext.tenantId;

    // Check required scopes (if specified via decorator)
    const requiredScopes = this.reflector.get<string[]>('apiScopes', context.getHandler());
    if (requiredScopes && requiredScopes.length > 0) {
      const hasAllScopes = requiredScopes.every(scope =>
        this.apiKeyService.hasScope(apiKeyContext.scopes, scope)
      );

      if (!hasAllScopes) {
        throw new UnauthorizedException('Insufficient API key scopes');
      }
    }

    return true;
  }

  private extractApiKey(request: any): string | null {
    // Check Authorization header: Bearer api_xxx_xxx_xxx
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check X-API-Key header
    const apiKeyHeader = request.headers['x-api-key'];
    if (apiKeyHeader) {
      return apiKeyHeader;
    }

    // Check query parameter (not recommended for production)
    if (request.query.api_key) {
      return request.query.api_key;
    }

    return null;
  }
}
