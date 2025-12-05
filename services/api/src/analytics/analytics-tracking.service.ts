import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface PageViewData {
  pageUrl: string;
  pageTitle?: string;
  referrer?: string;
  sessionId: string;
  visitorId: string;
  userId?: string;
  userAgent?: string;
  deviceType?: string;
}

export interface UserSignupData {
  userId: string;
  email: string;
  tenantId?: string;
  source?: string;
  medium?: string;
  campaign?: string;
}

export interface PaymentConversionData {
  userId: string;
  tenantId: string;
  amount: number;
  currency: string;
  planId: string;
  subscriptionId: string;
}

export interface TournamentCreatedData {
  userId: string;
  tenantId: string;
  tournamentId: string;
  participantCount: number;
}

@Injectable()
export class AnalyticsTrackingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Track a page view
   */
  async trackPageView(data: PageViewData): Promise<void> {
    await this.prisma.analyticsEvent.create({
      data: {
        eventType: 'page_view',
        eventCategory: 'engagement',
        eventLabel: data.pageTitle || data.pageUrl,
        sessionId: data.sessionId,
        userId: data.userId,
        visitorId: data.visitorId,
        pageUrl: data.pageUrl,
        pageTitle: data.pageTitle,
        referrer: data.referrer,
        userAgent: data.userAgent,
        deviceType: data.deviceType,
        metadata: {},
      },
    });
  }

  /**
   * Track user signup conversion
   */
  async trackUserSignup(data: UserSignupData): Promise<void> {
    // Track as analytics event
    await this.prisma.analyticsEvent.create({
      data: {
        eventType: 'user_signup',
        eventCategory: 'conversion',
        eventLabel: 'New User Registration',
        userId: data.userId,
        pageUrl: '/signup',
        metadata: {
          email: data.email,
          tenantId: data.tenantId,
        },
      },
    });

    // Track as conversion
    await this.prisma.conversion.create({
      data: {
        conversionType: 'signup',
        userId: data.userId,
        source: data.source,
        medium: data.medium,
        campaign: data.campaign,
        metadata: {
          email: data.email,
          tenantId: data.tenantId,
        },
      },
    });
  }

  /**
   * Track payment/subscription conversion
   */
  async trackPaymentConversion(data: PaymentConversionData): Promise<void> {
    // Track as analytics event
    await this.prisma.analyticsEvent.create({
      data: {
        eventType: 'payment_success',
        eventCategory: 'conversion',
        eventLabel: 'Subscription Payment',
        eventValue: data.amount,
        userId: data.userId,
        pageUrl: '/checkout',
        metadata: {
          tenantId: data.tenantId,
          currency: data.currency,
          planId: data.planId,
          subscriptionId: data.subscriptionId,
        },
      },
    });

    // Track as conversion with monetary value
    await this.prisma.conversion.create({
      data: {
        conversionType: 'subscription',
        conversionValue: data.amount,
        userId: data.userId,
        metadata: {
          tenantId: data.tenantId,
          currency: data.currency,
          planId: data.planId,
          subscriptionId: data.subscriptionId,
        },
      },
    });
  }

  /**
   * Track tournament creation
   */
  async trackTournamentCreated(data: TournamentCreatedData): Promise<void> {
    await this.prisma.analyticsEvent.create({
      data: {
        eventType: 'tournament_created',
        eventCategory: 'engagement',
        eventLabel: 'New Tournament',
        eventValue: data.participantCount,
        userId: data.userId,
        pageUrl: '/tournaments',
        metadata: {
          tenantId: data.tenantId,
          tournamentId: data.tournamentId,
          participantCount: data.participantCount,
        },
      },
    });
  }

  /**
   * Track button/link click
   */
  async trackClick(
    label: string,
    category: string,
    sessionId: string,
    visitorId: string,
    userId?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.prisma.analyticsEvent.create({
      data: {
        eventType: 'click',
        eventCategory: category,
        eventLabel: label,
        sessionId,
        visitorId,
        userId,
        pageUrl: metadata?.pageUrl || '/',
        metadata: metadata || {},
      },
    });
  }

  /**
   * Track question bank usage
   */
  async trackQuestionBankUsage(
    userId: string,
    tenantId: string,
    action: 'create' | 'edit' | 'delete' | 'view',
    questionId?: string,
  ): Promise<void> {
    await this.prisma.analyticsEvent.create({
      data: {
        eventType: 'question_bank_usage',
        eventCategory: 'engagement',
        eventLabel: `Question ${action}`,
        userId,
        pageUrl: '/questions',
        metadata: {
          tenantId,
          action,
          questionId,
        },
      },
    });
  }

  /**
   * Track practice session completion
   */
  async trackPracticeSession(
    userId: string,
    tenantId: string,
    sessionId: string,
    score: number,
    duration: number,
  ): Promise<void> {
    await this.prisma.analyticsEvent.create({
      data: {
        eventType: 'practice_session_completed',
        eventCategory: 'engagement',
        eventLabel: 'Practice Session',
        eventValue: score,
        userId,
        pageUrl: '/practice',
        metadata: {
          tenantId,
          sessionId,
          score,
          duration,
        },
      },
    });
  }

  /**
   * Get analytics summary for a date range
   */
  async getAnalyticsSummary(
    startDate: Date,
    endDate: Date,
    tenantId?: string,
  ): Promise<any> {
    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (tenantId) {
      whereClause.metadata = {
        path: ['tenantId'],
        equals: tenantId,
      };
    }

    // Get event counts by type
    const eventCounts = await this.prisma.analyticsEvent.groupBy({
      by: ['eventType'],
      where: whereClause,
      _count: true,
    });

    // Get conversion counts
    const conversionCounts = await this.prisma.conversion.groupBy({
      by: ['conversionType'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
      _sum: {
        conversionValue: true,
      },
    });

    // Get unique users
    const uniqueUsers = await this.prisma.analyticsEvent.findMany({
      where: whereClause,
      select: { userId: true },
      distinct: ['userId'],
    });

    // Get page views
    const pageViews = await this.prisma.analyticsEvent.count({
      where: {
        ...whereClause,
        eventType: 'page_view',
      },
    });

    return {
      dateRange: { start: startDate, end: endDate },
      eventCounts: eventCounts.reduce((acc, item) => {
        acc[item.eventType] = item._count;
        return acc;
      }, {} as Record<string, number>),
      conversions: conversionCounts.reduce((acc, item) => {
        acc[item.conversionType] = {
          count: item._count,
          totalValue: item._sum.conversionValue || 0,
        };
        return acc;
      }, {} as Record<string, any>),
      uniqueUsers: uniqueUsers.filter(u => u.userId).length,
      pageViews,
    };
  }

  /**
   * Get top pages by views
   */
  async getTopPages(limit: number = 10, tenantId?: string): Promise<any[]> {
    const whereClause: any = {
      eventType: 'page_view',
    };

    if (tenantId) {
      whereClause.metadata = {
        path: ['tenantId'],
        equals: tenantId,
      };
    }

    const topPages = await this.prisma.analyticsEvent.groupBy({
      by: ['pageUrl'],
      where: whereClause,
      _count: true,
      orderBy: {
        _count: {
          pageUrl: 'desc',
        },
      },
      take: limit,
    });

    return topPages.map(page => ({
      url: page.pageUrl,
      views: page._count,
    }));
  }

  /**
   * Get user activity timeline
   */
  async getUserActivityTimeline(
    userId: string,
    limit: number = 50,
  ): Promise<any[]> {
    const events = await this.prisma.analyticsEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        eventType: true,
        eventCategory: true,
        eventLabel: true,
        eventValue: true,
        pageUrl: true,
        createdAt: true,
        metadata: true,
      },
    });

    return events;
  }
}
