import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  MarketingContent,
  MarketingContentUpdateRequest,
  MarketingContentAuditLog,
} from '../types/marketing';

@Injectable()
export class MarketingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get current marketing content
   */
  async getContent(): Promise<MarketingContent> {
    try {
      // Get the latest active marketing content
      const content = await this.prisma.marketingContent.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });

      if (!content) {
        // Return default content if none exists
        return this.getDefaultContent();
      }

      return JSON.parse(content.contentJson) as MarketingContent;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve marketing content',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update marketing content (super_admin only)
   */
  async updateContent(
    updateRequest: MarketingContentUpdateRequest,
    userId: string,
    userEmail: string,
  ): Promise<MarketingContent> {
    try {
      // Validate the update request
      this.validateContent(updateRequest.content);

      // Deactivate current content
      await this.prisma.marketingContent.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });

      // Create new version
      const newContent = await this.prisma.marketingContent.create({
        data: {
          contentJson: JSON.stringify(updateRequest.content),
          isActive: true,
          version: await this.getNextVersion(),
          updatedBy: userId,
          updatedByEmail: userEmail,
          changeNotes: updateRequest.changeNotes || 'Content updated',
        },
      });

      // Create audit log entry
      await this.prisma.marketingContentAuditLog.create({
        data: {
          marketingContentId: newContent.id,
          action: 'update',
          changes: updateRequest.changeNotes || 'Content updated',
          userId: userId,
          userEmail: userEmail,
          previousVersion: await this.getPreviousVersion(),
          newVersion: newContent.version,
        },
      });

      return JSON.parse(newContent.contentJson) as MarketingContent;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update marketing content',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get marketing content history/audit log
   */
  async getHistory(): Promise<MarketingContentAuditLog[]> {
    try {
      const logs = await this.prisma.marketingContentAuditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100, // Limit to last 100 entries
      });

      return logs.map((log) => ({
        id: log.id,
        marketingContentId: log.marketingContentId,
        action: log.action as 'create' | 'update' | 'rollback',
        changes: log.changes,
        userId: log.userId,
        userEmail: log.userEmail,
        timestamp: log.createdAt.toISOString(),
        previousVersion: log.previousVersion,
        newVersion: log.newVersion,
      }));
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve marketing content history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get specific version of marketing content
   */
  async getVersion(versionId: string): Promise<MarketingContent> {
    try {
      const content = await this.prisma.marketingContent.findUnique({
        where: { id: versionId },
      });

      if (!content) {
        throw new HttpException(
          'Marketing content version not found',
          HttpStatus.NOT_FOUND,
        );
      }

      return JSON.parse(content.contentJson) as MarketingContent;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve marketing content version',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Rollback to a previous version
   */
  async rollback(
    versionId: string,
    userId: string,
    userEmail: string,
  ): Promise<MarketingContent> {
    try {
      // Get the version to rollback to
      const targetVersion = await this.prisma.marketingContent.findUnique({
        where: { id: versionId },
      });

      if (!targetVersion) {
        throw new HttpException(
          'Marketing content version not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Deactivate current content
      await this.prisma.marketingContent.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });

      // Create new version with rolled-back content
      const newContent = await this.prisma.marketingContent.create({
        data: {
          contentJson: targetVersion.contentJson,
          isActive: true,
          version: await this.getNextVersion(),
          updatedBy: userId,
          updatedByEmail: userEmail,
          changeNotes: `Rolled back to version ${targetVersion.version}`,
        },
      });

      // Create audit log entry
      await this.prisma.marketingContentAuditLog.create({
        data: {
          marketingContentId: newContent.id,
          action: 'rollback',
          changes: `Rolled back to version ${targetVersion.version}`,
          userId: userId,
          userEmail: userEmail,
          previousVersion: await this.getPreviousVersion(),
          newVersion: newContent.version,
        },
      });

      return JSON.parse(newContent.contentJson) as MarketingContent;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to rollback marketing content',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Validate marketing content structure
   */
  private validateContent(content: MarketingContent): void {
    if (!content.hero?.headline || !content.hero?.subheadline) {
      throw new Error('Hero section must have headline and subheadline');
    }

    if (!content.contactInfo?.email || !content.contactInfo?.phone) {
      throw new Error('Contact information must include email and phone');
    }

    // Add more validation as needed
  }

  /**
   * Get next version number
   */
  private async getNextVersion(): Promise<number> {
    const latestContent = await this.prisma.marketingContent.findFirst({
      orderBy: { version: 'desc' },
    });

    return latestContent ? latestContent.version + 1 : 1;
  }

  /**
   * Get previous version number
   */
  private async getPreviousVersion(): Promise<number> {
    const currentContent = await this.prisma.marketingContent.findFirst({
      where: { isActive: true },
      orderBy: { version: 'desc' },
    });

    return currentContent ? currentContent.version : 0;
  }

  /**
   * Get default marketing content
   */
  private getDefaultContent(): MarketingContent {
    return {
      hero: {
        headline: 'Transform Bible Learning with AI-Powered Quiz Tournaments',
        subheadline:
          'Engage your congregation with interactive, competitive Bible study experiences. Create custom tournaments, track progress, and build stronger communities.',
        ctaText: 'Get Started Free',
        ctaLink: '/auth',
        backgroundImage: '/images/hero-bg.jpg',
      },
      features: [
        {
          id: '1',
          title: 'AI Question Generation',
          description:
            'Generate unlimited Bible quiz questions instantly with our advanced AI system.',
          icon: 'brain',
        },
        {
          id: '2',
          title: 'Live Tournaments',
          description:
            'Host real-time competitive tournaments with automatic scoring and leaderboards.',
          icon: 'trophy',
        },
        {
          id: '3',
          title: 'Multi-Tenant Platform',
          description:
            'Perfect for churches, schools, and organizations of any size.',
          icon: 'users',
        },
      ],
      testimonials: [
        {
          id: '1',
          name: 'Pastor John Smith',
          role: 'Lead Pastor',
          organization: 'Grace Community Church',
          content:
            "This platform has revolutionized our youth Bible study program. Engagement is at an all-time high!",
          rating: 5,
          initials: 'JS',
          color: 'blue',
          avatar: '/images/testimonials/pastor-john.jpg',
        },
      ],
      socialProof: {
        totalUsers: 10000,
        activeUsers: '10,000+',
        churchesServed: '500+',
        quizzesHosted: '50,000+',
        customerRating: '4.9/5',
      },
      pricingTiers: [],
      faqs: [],
      contactInfo: {
        email: 'support@smartequiz.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main St, City, State 12345',
        supportHours: 'Mon-Fri 9AM-5PM EST',
        socialMedia: {
          facebook: '',
          twitter: '',
          instagram: '',
          linkedin: '',
        },
      },
    };
  }

  /**
   * Get preview data for content comparison
   * Returns both draft (current) and published versions
   */
  async getPreviewData(): Promise<{
    draft: MarketingContent;
    published: MarketingContent;
    hasChanges: boolean;
  }> {
    try {
      // Get current active content (this is the "published" version)
      const published = await this.getContent();

      // For now, draft and published are the same
      // In a full implementation, you'd store draft content separately
      // or retrieve unsaved changes from the frontend
      const draft = published;

      // Compare to check if there are changes
      const hasChanges = JSON.stringify(draft) !== JSON.stringify(published);

      return {
        draft,
        published,
        hasChanges,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve preview data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
