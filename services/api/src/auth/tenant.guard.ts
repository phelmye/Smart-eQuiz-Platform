import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Check if tenantId is set (either from middleware or API key)
    if (!request.tenantId && !request.user?.tenantId) {
      throw new UnauthorizedException('Tenant context required');
    }

    // Set tenantId on request if not already set
    if (!request.tenantId && request.user?.tenantId) {
      request.tenantId = request.user.tenantId;
    }

    return true;
  }
}
