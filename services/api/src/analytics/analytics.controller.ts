import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * POST /api/analytics/track
   * Track an analytics event (public endpoint for frontend tracking)
   */
  @Post('track')
  async trackEvent(@Body() eventData: any) {
    try {
      return await this.analyticsService.trackEvent(eventData);
    } catch (error) {
      throw new HttpException(
        'Failed to track event',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /api/analytics/conversion
   * Track a conversion event
   */
  @Post('conversion')
  async trackConversion(@Body() conversionData: any) {
    try {
      return await this.analyticsService.trackConversion(conversionData);
    } catch (error) {
      throw new HttpException(
        'Failed to track conversion',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/analytics/overview
   * Get analytics overview (super_admin only)
   */
  @Get('overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async getOverview(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      return await this.analyticsService.getOverview(
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
      );
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve analytics overview',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/analytics/events
   * Get analytics events with filtering (super_admin only)
   */
  @Get('events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async getEvents(
    @Query('eventType') eventType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      return await this.analyticsService.getEvents({
        eventType,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit: limit ? parseInt(limit, 10) : 100,
      });
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve events',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/analytics/conversions
   * Get conversion data (super_admin only)
   */
  @Get('conversions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async getConversions(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      return await this.analyticsService.getConversions(
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
      );
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve conversions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/analytics/cta-performance
   * Get CTA button performance metrics (super_admin only)
   */
  @Get('cta-performance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async getCtaPerformance(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      return await this.analyticsService.getCtaPerformance(
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
      );
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve CTA performance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/analytics/traffic-sources
   * Get traffic source breakdown (super_admin only)
   */
  @Get('traffic-sources')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async getTrafficSources(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      return await this.analyticsService.getTrafficSources(
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
      );
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve traffic sources',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/analytics/device-stats
   * Get device/browser statistics (super_admin only)
   */
  @Get('device-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async getDeviceStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      return await this.analyticsService.getDeviceStats(
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
      );
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve device statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/analytics/ab-tests
   * Get A/B test results (super_admin only)
   */
  @Get('ab-tests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async getAbTests() {
    try {
      return await this.analyticsService.getAbTests();
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve A/B tests',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /api/analytics/ab-tests
   * Create a new A/B test (super_admin only)
   */
  @Post('ab-tests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async createAbTest(@Body() testData: any) {
    try {
      return await this.analyticsService.createAbTest(testData);
    } catch (error) {
      throw new HttpException(
        'Failed to create A/B test',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
