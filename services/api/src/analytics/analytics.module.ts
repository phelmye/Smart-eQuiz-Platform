import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsTrackingService } from './analytics-tracking.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsTrackingService, PrismaService],
  exports: [AnalyticsService, AnalyticsTrackingService],
})
export class AnalyticsModule {}
