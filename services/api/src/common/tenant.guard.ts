import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Extract tenant ID from headers or subdomain
    const tenantId = 
      request.headers['x-tenant-id'] || 
      request.headers['tenant-id'] ||
      this.extractTenantFromHost(request.headers.host);
    
    if (tenantId) {
      request.tenantId = tenantId;
      return true;
    }
    
    // Allow requests without tenant ID for now (can be made strict later)
    return true;
  }
  
  private extractTenantFromHost(host: string): string | null {
    if (!host) return null;
    
    // Extract subdomain (e.g., "tenant1" from "tenant1.smartequiz.com")
    const parts = host.split('.');
    if (parts.length > 2) {
      return parts[0];
    }
    
    return null;
  }
}
