import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CreateLandingPageContentDto,
  LandingPageSection,
} from './dto/create-landing-page-content.dto';
import { UpdateLandingPageContentDto } from './dto/update-landing-page-content.dto';

@Injectable()
export class LandingPageService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create new landing page content version
   * Auto-increments version number for the section
   */
  async create(
    tenantId: string,
    userId: string,
    createDto: CreateLandingPageContentDto,
  ) {
    // Get highest version for this section
    const latestVersion = await this.prisma.landingPageContent.findFirst({
      where: {
        tenantId,
        section: createDto.section,
      },
      orderBy: {
        version: 'desc',
      },
    });

    const newVersion = latestVersion ? latestVersion.version + 1 : 1;

    return this.prisma.landingPageContent.create({
      data: {
        tenantId,
        section: createDto.section,
        content: createDto.content,
        version: newVersion,
        effectiveDate: createDto.effectiveDate
          ? new Date(createDto.effectiveDate)
          : new Date(),
        createdBy: userId,
      },
    });
  }

  /**
   * Update existing landing page content version
   * Creates a new version instead of modifying existing one
   */
  async update(
    id: string,
    tenantId: string,
    userId: string,
    updateDto: UpdateLandingPageContentDto,
  ) {
    // Verify the content exists and belongs to tenant
    const existing = await this.prisma.landingPageContent.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Landing page content not found');
    }

    // Create new version with updated content
    const latestVersion = await this.prisma.landingPageContent.findFirst({
      where: {
        tenantId,
        section: existing.section,
      },
      orderBy: {
        version: 'desc',
      },
    });

    const newVersion = latestVersion ? latestVersion.version + 1 : 1;

    return this.prisma.landingPageContent.create({
      data: {
        tenantId,
        section: existing.section,
        content: updateDto.content ?? existing.content,
        version: newVersion,
        effectiveDate: updateDto.effectiveDate
          ? new Date(updateDto.effectiveDate)
          : existing.effectiveDate,
        createdBy: userId,
      },
    });
  }

  /**
   * Get all versions for a specific section
   */
  async findAllVersions(tenantId: string, section: LandingPageSection) {
    return this.prisma.landingPageContent.findMany({
      where: {
        tenantId,
        section,
      },
      orderBy: {
        version: 'desc',
      },
    });
  }

  /**
   * Get active content for a specific section
   */
  async getActive(tenantId: string, section: LandingPageSection) {
    const content = await this.prisma.landingPageContent.findFirst({
      where: {
        tenantId,
        section,
        isActive: true,
      },
    });

    if (!content) {
      throw new NotFoundException(
        `No active content found for section: ${section}`,
      );
    }

    return content;
  }

  /**
   * Get all active content for all sections (used by landing page)
   */
  async getAllActive(tenantId: string) {
    const sections = Object.values(LandingPageSection);
    const activeContent = await this.prisma.landingPageContent.findMany({
      where: {
        tenantId,
        isActive: true,
        section: {
          in: sections,
        },
      },
    });

    // Return as object keyed by section for easy access
    return activeContent.reduce(
      (acc, content) => {
        acc[content.section] = content;
        return acc;
      },
      {} as Record<string, any>,
    );
  }

  /**
   * Activate a specific version
   * Deactivates all other versions for the same section
   */
  async activate(id: string, tenantId: string) {
    const content = await this.prisma.landingPageContent.findFirst({
      where: { id, tenantId },
    });

    if (!content) {
      throw new NotFoundException('Landing page content not found');
    }

    if (content.isActive) {
      throw new ConflictException('This version is already active');
    }

    // Use transaction to ensure atomicity
    return this.prisma.$transaction(async (tx) => {
      // Deactivate all versions for this section
      await tx.landingPageContent.updateMany({
        where: {
          tenantId,
          section: content.section,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      // Activate the specified version
      return tx.landingPageContent.update({
        where: { id },
        data: {
          isActive: true,
        },
      });
    });
  }

  /**
   * Deactivate a specific version
   */
  async deactivate(id: string, tenantId: string) {
    const content = await this.prisma.landingPageContent.findFirst({
      where: { id, tenantId },
    });

    if (!content) {
      throw new NotFoundException('Landing page content not found');
    }

    if (!content.isActive) {
      throw new ConflictException('This version is already inactive');
    }

    return this.prisma.landingPageContent.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  /**
   * Delete a specific version
   * Cannot delete active version
   */
  async delete(id: string, tenantId: string) {
    const content = await this.prisma.landingPageContent.findFirst({
      where: { id, tenantId },
    });

    if (!content) {
      throw new NotFoundException('Landing page content not found');
    }

    if (content.isActive) {
      throw new ConflictException('Cannot delete active version');
    }

    return this.prisma.landingPageContent.delete({
      where: { id },
    });
  }

  /**
   * Get version history for a section
   */
  async getHistory(tenantId: string, section: LandingPageSection) {
    return this.prisma.landingPageContent.findMany({
      where: {
        tenantId,
        section,
      },
      orderBy: [{ version: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        version: true,
        isActive: true,
        effectiveDate: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Get specific version by ID
   */
  async findOne(id: string, tenantId: string) {
    const content = await this.prisma.landingPageContent.findFirst({
      where: { id, tenantId },
    });

    if (!content) {
      throw new NotFoundException('Landing page content not found');
    }

    return content;
  }
}
