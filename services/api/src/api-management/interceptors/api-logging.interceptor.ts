import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiLogService } from '../api-log.service';

@Injectable()
export class ApiLoggingInterceptor implements NestInterceptor {
  constructor(private apiLogService: ApiLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          this.logRequest(context, startTime, 200, null);
        },
        error: (error) => {
          this.logRequest(context, startTime, error.status || 500, error.message);
        }
      })
    );
  }

  private async logRequest(
    context: ExecutionContext,
    startTime: number,
    statusCode: number,
    errorMessage: string | null
  ) {
    const request = context.switchToHttp().getRequest();
    const responseTime = Date.now() - startTime;

    // Only log if API key was used (not regular JWT auth)
    if (!request.apiKey) {
      return;
    }

    const endpoint = `${request.route?.path || request.url}`;
    const method = request.method;
    const ipAddress = request.ip || request.connection?.remoteAddress || 'unknown';
    const userAgent = request.headers['user-agent'];

    // Calculate sizes
    const requestSize = request.headers['content-length'] 
      ? parseInt(request.headers['content-length']) 
      : null;

    try {
      await this.apiLogService.logRequest({
        tenantId: request.tenantId,
        apiKeyId: request.apiKey.apiKeyId,
        endpoint,
        method,
        statusCode,
        responseTime,
        requestSize,
        ipAddress,
        userAgent,
        errorMessage,
        metadata: {
          query: request.query,
          params: request.params,
        }
      });
    } catch (error) {
      // Don't fail request if logging fails
      console.error('Failed to log API request:', error);
    }
  }
}
