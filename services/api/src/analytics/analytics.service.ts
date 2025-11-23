import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Track an analytics event
   */
  async trackEvent(eventData: any) {
    try {
      const event = await this.prisma.analyticsEvent.create({
        data: {
          eventType: eventData.eventType,
          eventCategory: eventData.eventCategory || 'marketing',
          eventLabel: eventData.eventLabel,
          eventValue: eventData.eventValue,
          sessionId: eventData.sessionId,
          userId: eventData.userId,
          visitorId: eventData.visitorId,
          pageUrl: eventData.pageUrl,
          pageTitle: eventData.pageTitle,
          referrer: eventData.referrer,
          userAgent: eventData.userAgent,
          deviceType: eventData.deviceType,
          browser: eventData.browser,
          operatingSystem: eventData.operatingSystem,
          screenResolution: eventData.screenResolution,
          country: eventData.country,
          city: eventData.city,
          ipAddress: eventData.ipAddress,
          metadata: eventData.metadata || {},
        },
      });

      return { success: true, eventId: event.id };
    } catch (error) {
      throw new HttpException(
        'Failed to track event',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Track a conversion
   */
  async trackConversion(conversionData: any) {
    try {
      const conversion = await this.prisma.conversion.create({
        data: {
          conversionType: conversionData.conversionType,
          conversionValue: conversionData.conversionValue,
          userId: conversionData.userId,
          visitorId: conversionData.visitorId,
          sessionId: conversionData.sessionId,
          source: conversionData.source,
          medium: conversionData.medium,
          campaign: conversionData.campaign,
          funnelStep: conversionData.funnelStep,
          funnelStage: conversionData.funnelStage,
          metadata: conversionData.metadata || {},
        },
      });

      return { success: true, conversionId: conversion.id };
    } catch (error) {
      throw new HttpException(
        'Failed to track conversion',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get analytics overview
   */
  async getOverview(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
    const end = endDate || new Date();

    try {
      // Get total events
      const totalEvents = await this.prisma.analyticsEvent.count({
        where: {
          createdAt: { gte: start, lte: end },
        },
      });

      // Get total conversions
      const totalConversions = await this.prisma.conversion.count({
        where: {
          createdAt: { gte: start, lte: end },
        },
      });

      // Get unique visitors
      const uniqueVisitors = await this.prisma.analyticsEvent.groupBy({
        by: ['visitorId'],
        where: {
          createdAt: { gte: start, lte: end },
          visitorId: { not: null },
        },
      });

      // Get CTA clicks
      const ctaClicks = await this.prisma.analyticsEvent.count({
        where: {
          eventType: 'cta_click',
          createdAt: { gte: start, lte: end },
        },
      });

      // Get page views
      const pageViews = await this.prisma.analyticsEvent.count({
        where: {
          eventType: 'page_view',
          createdAt: { gte: start, lte: end },
        },
      });

      // Calculate conversion rate
      const conversionRate =
        pageViews > 0 ? (totalConversions / pageViews) * 100 : 0;

      // Get top pages
      const topPages = await this.prisma.analyticsEvent.groupBy({
        by: ['pageUrl'],
        where: {
          eventType: 'page_view',
          createdAt: { gte: start, lte: end },
        },
        _count: {
          pageUrl: true,
        },
        orderBy: {
          _count: {
            pageUrl: 'desc',
          },
        },
        take: 10,
      });

      // Get events by day
      const eventsByDay = await this.prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM "AnalyticsEvent"
        WHERE created_at >= ${start} AND created_at <= ${end}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;

      // Get conversions by type
      const conversionsByType = await this.prisma.conversion.groupBy({
        by: ['conversionType'],
        where: {
          createdAt: { gte: start, lte: end },
        },
        _count: {
          conversionType: true,
        },
        orderBy: {
          _count: {
            conversionType: 'desc',
          },
        },
      });

      return {
        overview: {
          totalEvents,
          totalConversions,
          uniqueVisitors: uniqueVisitors.length,
          ctaClicks,
          pageViews,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
        },
        topPages: topPages.map((page) => ({
          url: page.pageUrl,
          views: page._count.pageUrl,
        })),
        eventsByDay,
        conversionsByType: conversionsByType.map((conv) => ({
          type: conv.conversionType,
          count: conv._count.conversionType,
        })),
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve analytics overview',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get analytics events
   */
  async getEvents(filters: {
    eventType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    const { eventType, startDate, endDate, limit = 100 } = filters;

    try {
      const events = await this.prisma.analyticsEvent.findMany({
        where: {
          ...(eventType && { eventType }),
          ...(startDate && endDate && {
            createdAt: { gte: startDate, lte: endDate },
          }),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return events;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve events',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get conversions
   */
  async getConversions(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    try {
      const conversions = await this.prisma.conversion.findMany({
        where: {
          createdAt: { gte: start, lte: end },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      // Get conversion funnel data
      const funnelData = await this.prisma.conversion.groupBy({
        by: ['funnelStage'],
        where: {
          createdAt: { gte: start, lte: end },
          funnelStage: { not: null },
        },
        _count: {
          funnelStage: true,
        },
      });

      return {
        conversions,
        funnelData: funnelData.map((stage) => ({
          stage: stage.funnelStage,
          count: stage._count.funnelStage,
        })),
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve conversions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get CTA performance
   */
  async getCtaPerformance(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    try {
      const ctaClicks = await this.prisma.analyticsEvent.groupBy({
        by: ['eventLabel'],
        where: {
          eventType: 'cta_click',
          createdAt: { gte: start, lte: end },
          eventLabel: { not: null },
        },
        _count: {
          eventLabel: true,
        },
        orderBy: {
          _count: {
            eventLabel: 'desc',
          },
        },
      });

      return ctaClicks.map((cta) => ({
        label: cta.eventLabel,
        clicks: cta._count.eventLabel,
      }));
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve CTA performance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get traffic sources
   */
  async getTrafficSources(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    try {
      const sources = await this.prisma.conversion.groupBy({
        by: ['source', 'medium'],
        where: {
          createdAt: { gte: start, lte: end },
          source: { not: null },
        },
        _count: {
          source: true,
        },
        orderBy: {
          _count: {
            source: 'desc',
          },
        },
      });

      return sources.map((src) => ({
        source: src.source,
        medium: src.medium,
        count: src._count.source,
      }));
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve traffic sources',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get device statistics
   */
  async getDeviceStats(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    try {
      // Device type breakdown
      const deviceTypes = await this.prisma.analyticsEvent.groupBy({
        by: ['deviceType'],
        where: {
          createdAt: { gte: start, lte: end },
          deviceType: { not: null },
        },
        _count: {
          deviceType: true,
        },
        orderBy: {
          _count: {
            deviceType: 'desc',
          },
        },
      });

      // Browser breakdown
      const browsers = await this.prisma.analyticsEvent.groupBy({
        by: ['browser'],
        where: {
          createdAt: { gte: start, lte: end },
          browser: { not: null },
        },
        _count: {
          browser: true,
        },
        orderBy: {
          _count: {
            browser: 'desc',
          },
        },
        take: 10,
      });

      // Operating system breakdown
      const operatingSystems = await this.prisma.analyticsEvent.groupBy({
        by: ['operatingSystem'],
        where: {
          createdAt: { gte: start, lte: end },
          operatingSystem: { not: null },
        },
        _count: {
          operatingSystem: true,
        },
        orderBy: {
          _count: {
            operatingSystem: 'desc',
          },
        },
        take: 10,
      });

      return {
        deviceTypes: deviceTypes.map((device) => ({
          type: device.deviceType,
          count: device._count.deviceType,
        })),
        browsers: browsers.map((browser) => ({
          name: browser.browser,
          count: browser._count.browser,
        })),
        operatingSystems: operatingSystems.map((os) => ({
          name: os.operatingSystem,
          count: os._count.operatingSystem,
        })),
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve device statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get A/B tests
   */
  async getAbTests() {
    try {
      const tests = await this.prisma.aBTest.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { variants: true },
          },
        },
      });

      return tests.map((test) => ({
        ...test,
        conversionRateA:
          test.visitorsA > 0
            ? ((test.conversionsA / test.visitorsA) * 100).toFixed(2)
            : '0.00',
        conversionRateB:
          test.visitorsB > 0
            ? ((test.conversionsB / test.visitorsB) * 100).toFixed(2)
            : '0.00',
        totalParticipants: test._count.variants,
      }));
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve A/B tests',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create A/B test
   */
  async createAbTest(testData: any) {
    try {
      const test = await this.prisma.aBTest.create({
        data: {
          name: testData.name,
          description: testData.description,
          variantA: testData.variantA,
          variantB: testData.variantB,
          trafficSplitA: testData.trafficSplitA || 50,
          trafficSplitB: testData.trafficSplitB || 50,
          status: testData.status || 'draft',
          primaryGoal: testData.primaryGoal,
          startDate: testData.startDate ? new Date(testData.startDate) : null,
          endDate: testData.endDate ? new Date(testData.endDate) : null,
        },
      });

      return test;
    } catch (error) {
      throw new HttpException(
        'Failed to create A/B test',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
