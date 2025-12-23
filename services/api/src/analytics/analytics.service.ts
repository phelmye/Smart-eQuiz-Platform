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

  /**
   * Get platform dashboard statistics
   * Aggregates data for super admin dashboard
   */
  async getDashboardStats() {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Get tenant statistics (status field doesn't exist, using count only)
      const [totalTenants] = await Promise.all([
        this.prisma.tenant.count(),
      ]);

      // Get user statistics (status field doesn't exist, using count only)
      const [totalUsers] = await Promise.all([
        this.prisma.user.count(),
      ]);

      // Calculate MRR from tenants (plan relation needs to be included)
      const tenantsWithPlans = await this.prisma.tenant.findMany({
        include: { plan: true },
      });

      const mrr = tenantsWithPlans.reduce((sum, tenant) => {
        // Plan price calculation would go here if plan model has price
        return sum;
        }
        return sum;
      }, 0);

      // Calculate growth metrics
      const [tenantsLast30, tenantsPrevious30, usersLast30, usersPrevious30] = await Promise.all([
        this.prisma.tenant.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        this.prisma.tenant.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
        this.prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        this.prisma.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      ]);

      const tenantGrowth = tenantsPrevious30 > 0 
        ? ((tenantsLast30 - tenantsPrevious30) / tenantsPrevious30) * 100 
        : 0;
      
      const userGrowth = usersPrevious30 > 0 
        ? ((usersLast30 - usersPrevious30) / usersPrevious30) * 100 
        : 0;

      // Get revenue trend (last 6 months) - simplified without status
      const revenueData = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const tenants = await this.prisma.tenant.findMany({
          where: { createdAt: { lte: monthEnd } },
          include: { plan: true },
        });

        const revenue = 0; // Plan price calculation would go here
        
        revenueData.push({
          month: monthStart.toLocaleString('default', { month: 'short' }),
          revenue: Math.round(revenue),
          target: Math.round(revenue * 0.9),
        });
      }

      // Get tenant growth data
      const tenantGrowthData = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const count = await this.prisma.tenant.count({
          where: { createdAt: { gte: monthStart, lte: monthEnd } },
        });

        tenantGrowthData.push({
          month: monthStart.toLocaleString('default', { month: 'short' }),
          tenants: count,
        });
      }

      // Get tenants by plan - removed status filter
      const tenantsByPlan = await this.prisma.tenant.groupBy({
        by: ['planId'],
        _count: true,
      });

      const planCounts = await Promise.all(
        tenantsByPlan.map(async (item) => {
          const plan = await this.prisma.plan.findUnique({ where: { id: item.planId } });
          return {
            name: plan?.name || 'Unknown',
            value: item._count,
          };
        })
      );

      // Get recent activity
      const recentTenants = await this.prisma.tenant.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, createdAt: true },
      });

      const recentUsers = await this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
      });

      const activities = [
        ...recentTenants.map(t => ({
          type: 'tenant_created',
          description: `New tenant: ${t.name}`,
          timestamp: t.createdAt.toISOString(),
        })),
        ...recentUsers.map(u => ({
          type: 'user_created',
          description: `New user: ${u.firstName || u.lastName || u.email}`,
          timestamp: u.createdAt.toISOString(),
        })),
      ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      return {
        stats: {
          totalTenants,
          activeTenants: totalTenants, // No status field
          trialTenants: 0, // No status field
          suspendedTenants: 0, // No status field
          totalUsers,
          activeUsers: totalUsers, // No status field
          mrr: Math.round(mrr),
          arr: Math.round(mrr * 12),
          tenantGrowth: Math.round(tenantGrowth * 10) / 10,
          userGrowth: Math.round(userGrowth * 10) / 10,
        },
        charts: {
          revenueData,
          tenantGrowthData,
          tenantsByPlan: planCounts,
        },
        activities,
      };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      throw new HttpException(
        'Failed to get dashboard statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
