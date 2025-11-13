import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: any, _res: any, next: Function) {
    // Expect tenant identifier in X-Tenant-Id header for now (could be subdomain)
    const t = (req.headers && (req.headers['x-tenant-id'] || req.headers['X-Tenant-Id'])) || req.query && req.query['tenant'];
    if (t) req.tenantId = t;
    next();
  }
}
