import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateLegalDocumentDto } from './dto/create-legal-document.dto';
import { UpdateLegalDocumentDto } from './dto/update-legal-document.dto';
import { AcceptLegalDocumentDto } from './dto/accept-legal-document.dto';
import { LegalDocumentType } from '@prisma/client';

@Injectable()
export class LegalDocumentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new legal document version
   * Automatically increments version number and deactivates previous versions
   */
  async create(tenantId: string, userId: string, dto: CreateLegalDocumentDto) {
    // Find the latest version of this document type
    const latestDoc = await this.prisma.legalDocument.findFirst({
      where: { tenantId, type: dto.type },
      orderBy: { version: 'desc' },
    });

    const nextVersion = latestDoc ? latestDoc.version + 1 : 1;

    // If this should be the active version, deactivate others
    const shouldActivate = dto.effectiveDate 
      ? new Date(dto.effectiveDate) <= new Date()
      : true;

    if (shouldActivate) {
      await this.prisma.legalDocument.updateMany({
        where: { tenantId, type: dto.type, isActive: true },
        data: { isActive: false },
      });
    }

    return this.prisma.legalDocument.create({
      data: {
        tenantId,
        type: dto.type,
        title: dto.title,
        content: dto.content,
        version: nextVersion,
        isActive: shouldActivate,
        requiresAcceptance: dto.requiresAcceptance ?? true,
        effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : new Date(),
        createdBy: userId,
      },
      include: {
        acceptances: {
          select: {
            userId: true,
            acceptedAt: true,
          },
        },
      },
    });
  }

  /**
   * Update an existing legal document (creates new version)
   */
  async update(tenantId: string, id: string, userId: string, dto: UpdateLegalDocumentDto) {
    const existingDoc = await this.prisma.legalDocument.findFirst({
      where: { id, tenantId },
    });

    if (!existingDoc) {
      throw new NotFoundException('Legal document not found');
    }

    // Create a new version instead of updating
    return this.create(tenantId, userId, {
      type: existingDoc.type,
      title: dto.title ?? existingDoc.title,
      content: dto.content ?? existingDoc.content,
      requiresAcceptance: dto.requiresAcceptance ?? existingDoc.requiresAcceptance,
      effectiveDate: dto.effectiveDate ?? existingDoc.effectiveDate.toISOString(),
    });
  }

  /**
   * Activate a specific document version
   */
  async activate(tenantId: string, id: string) {
    const document = await this.prisma.legalDocument.findFirst({
      where: { id, tenantId },
    });

    if (!document) {
      throw new NotFoundException('Legal document not found');
    }

    // Deactivate all other versions of this type
    await this.prisma.legalDocument.updateMany({
      where: { tenantId, type: document.type, isActive: true },
      data: { isActive: false },
    });

    // Activate this version
    return this.prisma.legalDocument.update({
      where: { id },
      data: { isActive: true },
    });
  }

  /**
   * Get active version of a specific document type
   */
  async getActive(tenantId: string, type: LegalDocumentType) {
    const document = await this.prisma.legalDocument.findFirst({
      where: { tenantId, type, isActive: true },
      include: {
        acceptances: {
          select: {
            userId: true,
            acceptedAt: true,
            documentVersion: true,
          },
          orderBy: { acceptedAt: 'desc' },
          take: 100,
        },
      },
    });

    if (!document) {
      throw new NotFoundException(`No active ${type} document found for this tenant`);
    }

    return document;
  }

  /**
   * Get all versions of a document type
   */
  async getVersionHistory(tenantId: string, type: LegalDocumentType) {
    return this.prisma.legalDocument.findMany({
      where: { tenantId, type },
      orderBy: { version: 'desc' },
      include: {
        acceptances: {
          select: {
            userId: true,
            acceptedAt: true,
          },
        },
      },
    });
  }

  /**
   * Get a specific version by ID
   */
  async getById(tenantId: string, id: string) {
    const document = await this.prisma.legalDocument.findFirst({
      where: { id, tenantId },
      include: {
        acceptances: {
          select: {
            userId: true,
            acceptedAt: true,
            documentVersion: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Legal document not found');
    }

    return document;
  }

  /**
   * Get all document types for a tenant
   */
  async getAllForTenant(tenantId: string) {
    // Get active version of each document type
    const documentTypes = Object.values(LegalDocumentType);
    const documents = await Promise.all(
      documentTypes.map(async (type) => {
        try {
          return await this.getActive(tenantId, type);
        } catch (error) {
          return null; // No document of this type exists
        }
      })
    );

    return documents.filter((doc) => doc !== null);
  }

  /**
   * Record user acceptance of a legal document
   */
  async acceptDocument(userId: string, dto: AcceptLegalDocumentDto) {
    const document = await this.prisma.legalDocument.findUnique({
      where: { id: dto.documentId },
    });

    if (!document) {
      throw new NotFoundException('Legal document not found');
    }

    if (document.version !== dto.documentVersion) {
      throw new BadRequestException('Document version mismatch');
    }

    // Check if user already accepted this document
    const existingAcceptance = await this.prisma.legalDocumentAcceptance.findUnique({
      where: {
        userId_documentId: {
          userId,
          documentId: dto.documentId,
        },
      },
    });

    if (existingAcceptance) {
      throw new ConflictException('User has already accepted this document');
    }

    return this.prisma.legalDocumentAcceptance.create({
      data: {
        userId,
        documentId: dto.documentId,
        documentVersion: dto.documentVersion,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
      },
      include: {
        document: {
          select: {
            type: true,
            title: true,
            version: true,
          },
        },
      },
    });
  }

  /**
   * Check if user has accepted all required documents
   */
  async getUserAcceptanceStatus(userId: string, tenantId: string) {
    // Get all active required documents for tenant
    const requiredDocs = await this.prisma.legalDocument.findMany({
      where: { 
        tenantId, 
        isActive: true, 
        requiresAcceptance: true,
      },
      select: {
        id: true,
        type: true,
        title: true,
        version: true,
      },
    });

    // Get user's acceptances
    const acceptances = await this.prisma.legalDocumentAcceptance.findMany({
      where: {
        userId,
        documentId: { in: requiredDocs.map(doc => doc.id) },
      },
      include: {
        document: {
          select: {
            type: true,
            title: true,
            version: true,
          },
        },
      },
    });

    // Compare required vs accepted
    const pendingDocs = requiredDocs.filter(
      (doc) => !acceptances.some((acc) => acc.documentId === doc.id)
    );

    return {
      hasAcceptedAll: pendingDocs.length === 0,
      requiredCount: requiredDocs.length,
      acceptedCount: acceptances.length,
      pendingDocuments: pendingDocs,
      acceptances,
    };
  }

  /**
   * Delete a specific version (soft delete - keep for audit trail)
   */
  async delete(tenantId: string, id: string) {
    const document = await this.prisma.legalDocument.findFirst({
      where: { id, tenantId },
    });

    if (!document) {
      throw new NotFoundException('Legal document not found');
    }

    if (document.isActive) {
      throw new BadRequestException('Cannot delete the active version. Please activate another version first.');
    }

    // In production, you might want to soft delete instead of hard delete
    return this.prisma.legalDocument.delete({
      where: { id },
    });
  }
}
