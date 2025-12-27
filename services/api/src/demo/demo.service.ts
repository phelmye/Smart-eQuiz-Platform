import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { randomBytes } from 'crypto';

export interface CreateDemoTemplateDto {
  version: string;
  name: string;
  description?: string;
  templateData: any;
  createdBy?: string;
}

export interface UpdateDemoTemplateDto {
  name?: string;
  description?: string;
  templateData?: any;
}

export interface DemoSessionData {
  sessionToken: string;
  templateVersion: string;
  expiresAt: Date;
  mergedData: any;
}

@Injectable()
export class DemoService {
  private readonly SESSION_DURATION_HOURS = 1; // Session expires after 1 hour of inactivity
  private readonly CLEANUP_RETENTION_HOURS = 24; // Keep expired sessions for 24 hours for analytics

  constructor(private prisma: PrismaService) {}

  /**
   * Platform Admin: Create new demo template
   */
  async createTemplate(dto: CreateDemoTemplateDto) {
    // Validate template data structure
    this.validateTemplateData(dto.templateData);

    const template = await this.prisma.demoTemplate.create({
      data: {
        version: dto.version,
        name: dto.name,
        description: dto.description,
        templateData: dto.templateData,
        createdBy: dto.createdBy,
        isActive: false, // Must be explicitly activated
      },
    });

    return template;
  }

  /**
   * Platform Admin: Update existing template
   */
  async updateTemplate(templateId: string, dto: UpdateDemoTemplateDto) {
    const template = await this.prisma.demoTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Demo template not found');
    }

    if (dto.templateData) {
      this.validateTemplateData(dto.templateData);
    }

    return this.prisma.demoTemplate.update({
      where: { id: templateId },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Platform Admin: Activate a template (deactivates others)
   */
  async activateTemplate(templateId: string) {
    const template = await this.prisma.demoTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Demo template not found');
    }

    // Deactivate all other templates
    await this.prisma.demoTemplate.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Activate the selected template
    return this.prisma.demoTemplate.update({
      where: { id: templateId },
      data: {
        isActive: true,
        activatedAt: new Date(),
      },
    });
  }

  /**
   * Platform Admin: Get all templates
   */
  async listTemplates() {
    return this.prisma.demoTemplate.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { demoSessions: true },
        },
      },
    });
  }

  /**
   * Platform Admin: Get template by ID
   */
  async getTemplate(templateId: string) {
    const template = await this.prisma.demoTemplate.findUnique({
      where: { id: templateId },
      include: {
        demoSessions: {
          where: {
            expiresAt: { gte: new Date() },
          },
          orderBy: { lastActivityAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Demo template not found');
    }

    return template;
  }

  /**
   * Platform Admin: Delete template
   */
  async deleteTemplate(templateId: string) {
    const template = await this.prisma.demoTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Demo template not found');
    }

    if (template.isActive) {
      throw new BadRequestException('Cannot delete active template');
    }

    await this.prisma.demoTemplate.delete({
      where: { id: templateId },
    });

    return { message: 'Template deleted successfully' };
  }

  /**
   * Public: Create or retrieve demo session
   */
  async getOrCreateSession(
    sessionToken?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<DemoSessionData> {
    // Try to find existing session
    if (sessionToken) {
      const session = await this.prisma.demoSession.findUnique({
        where: { sessionToken },
        include: { template: true },
      });

      if (session && session.expiresAt > new Date()) {
        // Update last activity and extend expiration
        const updatedSession = await this.prisma.demoSession.update({
          where: { id: session.id },
          data: {
            lastActivityAt: new Date(),
            expiresAt: this.calculateExpiration(),
            visitCount: { increment: 1 },
          },
          include: { template: true },
        });

        return {
          sessionToken: updatedSession.sessionToken,
          templateVersion: updatedSession.template.version,
          expiresAt: updatedSession.expiresAt,
          mergedData: this.mergeData(
            updatedSession.template.templateData,
            updatedSession.changes,
          ),
        };
      }
    }

    // Create new session
    const activeTemplate = await this.getActiveTemplate();
    const newSessionToken = this.generateSessionToken();

    const newSession = await this.prisma.demoSession.create({
      data: {
        sessionToken: newSessionToken,
        templateId: activeTemplate.id,
        expiresAt: this.calculateExpiration(),
        ipAddress,
        userAgent,
      },
      include: { template: true },
    });

    return {
      sessionToken: newSession.sessionToken,
      templateVersion: newSession.template.version,
      expiresAt: newSession.expiresAt,
      mergedData: newSession.template.templateData,
    };
  }

  /**
   * Public: Update session changes
   */
  async updateSessionChanges(sessionToken: string, changes: any) {
    const session = await this.prisma.demoSession.findUnique({
      where: { sessionToken },
    });

    if (!session) {
      throw new NotFoundException('Demo session not found');
    }

    if (session.expiresAt < new Date()) {
      throw new BadRequestException('Demo session expired');
    }

    // Merge with existing changes
    const currentChanges = session.changes as any;
    const mergedChanges = this.deepMerge(currentChanges, changes);

    return this.prisma.demoSession.update({
      where: { sessionToken },
      data: {
        changes: mergedChanges,
        lastActivityAt: new Date(),
        expiresAt: this.calculateExpiration(),
      },
    });
  }

  /**
   * Public: Get session data
   */
  async getSessionData(sessionToken: string): Promise<DemoSessionData> {
    const session = await this.prisma.demoSession.findUnique({
      where: { sessionToken },
      include: { template: true },
    });

    if (!session) {
      throw new NotFoundException('Demo session not found');
    }

    if (session.expiresAt < new Date()) {
      throw new BadRequestException('Demo session expired');
    }

    return {
      sessionToken: session.sessionToken,
      templateVersion: session.template.version,
      expiresAt: session.expiresAt,
      mergedData: this.mergeData(session.template.templateData, session.changes),
    };
  }

  /**
   * Public: Track demo analytics
   */
  async trackEvent(sessionId: string, eventType: string, featureName: string, metadata?: any) {
    return this.prisma.demoAnalytics.create({
      data: {
        sessionId,
        eventType,
        featureName,
        metadata,
      },
    });
  }

  /**
   * Platform Admin: Get demo analytics
   */
  async getAnalytics(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Popular features
    const popularFeatures = await this.prisma.demoAnalytics.groupBy({
      by: ['featureName'],
      where,
      _count: { featureName: true },
      orderBy: { _count: { featureName: 'desc' } },
      take: 20,
    });

    // Session stats
    const totalSessions = await this.prisma.demoSession.count();
    const activeSessions = await this.prisma.demoSession.count({
      where: { expiresAt: { gte: new Date() } },
    });

    // Event types
    const eventTypes = await this.prisma.demoAnalytics.groupBy({
      by: ['eventType'],
      where,
      _count: { eventType: true },
    });

    return {
      totalSessions,
      activeSessions,
      popularFeatures: popularFeatures.map(f => ({
        feature: f.featureName,
        count: f._count.featureName,
      })),
      eventTypes: eventTypes.map(e => ({
        type: e.eventType,
        count: e._count.eventType,
      })),
    };
  }

  /**
   * Cron: Clean up expired sessions (runs daily at 2 AM)
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredSessions() {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - this.CLEANUP_RETENTION_HOURS);

    const result = await this.prisma.demoSession.deleteMany({
      where: {
        expiresAt: { lt: cutoffDate },
      },
    });

    console.log(`[Demo Cleanup] Deleted ${result.count} expired demo sessions`);
    return result;
  }

  /**
   * Platform Admin: Force cleanup (on-demand)
   */
  async forceCleanup() {
    return this.cleanupExpiredSessions();
  }

  // Private helper methods

  private async getActiveTemplate() {
    const template = await this.prisma.demoTemplate.findFirst({
      where: { isActive: true },
    });

    if (!template) {
      throw new NotFoundException('No active demo template found. Please activate a template.');
    }

    return template;
  }

  private generateSessionToken(): string {
    return randomBytes(32).toString('hex');
  }

  private calculateExpiration(): Date {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + this.SESSION_DURATION_HOURS);
    return expiration;
  }

  private validateTemplateData(data: any) {
    // Basic validation - ensure required fields exist
    if (!data || typeof data !== 'object') {
      throw new BadRequestException('Template data must be a valid object');
    }

    // Add more specific validation as needed
    // e.g., check for required fields like questions, users, etc.
  }

  private mergeData(templateData: any, changes: any): any {
    if (!changes || Object.keys(changes).length === 0) {
      return templateData;
    }

    return this.deepMerge(templateData, changes);
  }

  private deepMerge(target: any, source: any): any {
    const output = { ...target };

    for (const key in source) {
      if (source[key] instanceof Object && key in target) {
        output[key] = this.deepMerge(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    }

    return output;
  }
}
