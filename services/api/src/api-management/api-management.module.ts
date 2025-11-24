import { Module } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { WebhookService } from './webhook.service';
import { ApiLogService } from './api-log.service';
import { ApiKeyController } from './api-key.controller';
import { WebhookController } from './webhook.controller';
import { ApiLogController } from './api-log.controller';
import { ApiKeyGuard } from './guards/api-key.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { ApiLoggingInterceptor } from './interceptors/api-logging.interceptor';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    ApiKeyController,
    WebhookController,
    ApiLogController,
  ],
  providers: [
    ApiKeyService,
    WebhookService,
    ApiLogService,
    ApiKeyGuard,
    RateLimitGuard,
    ApiLoggingInterceptor,
  ],
  exports: [
    ApiKeyService,
    WebhookService,
    ApiLogService,
    ApiKeyGuard,
    RateLimitGuard,
    ApiLoggingInterceptor,
  ],
})
export class ApiManagementModule {}
