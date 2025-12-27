import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mediaLogger } from '../common/logger.service';

export interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  url: string;
  thumbnailUrl?: string;
  category: string;
  altText?: string;
  uploadedBy: string;
  uploadedByEmail: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class MediaService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'media');
  private readonly publicUrl = process.env.PUBLIC_URL || 'http://localhost:3000';

  constructor(private prisma: PrismaService) {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'thumbnails'), { recursive: true });
    } catch (error) {
      mediaLogger.uploadFailed('upload-dir', error as Error);
    }
  }

  /**
   * Upload a file and create database record
   */
  async uploadFile(
    file: Express.Multer.File,
    metadata: { category: string; altText?: string; tags: string[] },
    userId: string,
    userEmail: string,
    tenantId: string, // Required for tenant isolation
  ): Promise<MediaAsset> {
    try {
      // Validate file type
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new HttpException(
          'Invalid file type. Only images are allowed.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Generate unique filename
      const fileExt = path.extname(file.originalname);
      const filename = `${uuidv4()}${fileExt}`;
      const storageKey = `media/${filename}`;
      const filePath = path.join(this.uploadDir, filename);

      // Save original file
      await fs.writeFile(filePath, file.buffer);

      // Get image dimensions and create thumbnail
      let width: number | undefined;
      let height: number | undefined;
      let thumbnailUrl: string | undefined;

      if (file.mimetype.startsWith('image/') && file.mimetype !== 'image/svg+xml') {
        try {
          const metadata = await sharp(file.buffer).metadata();
          width = metadata.width;
          height = metadata.height;

          // Create thumbnail (max 300x300)
          const thumbnailFilename = `thumb_${filename}`;
          const thumbnailPath = path.join(this.uploadDir, 'thumbnails', thumbnailFilename);
          
          await sharp(file.buffer)
            .resize(300, 300, {
              fit: 'inside',
              withoutEnlargement: true,
            })
            .toFile(thumbnailPath);

          thumbnailUrl = `${this.publicUrl}/uploads/media/thumbnails/${thumbnailFilename}`;
        } catch (error) {
          mediaLogger.processingStart(filename, 'thumbnail');
          if (error instanceof Error) {
            mediaLogger.uploadFailed(`thumb_${filename}`, error);
          }
        }
      }

      // Create database record
      const asset = await this.prisma.mediaAsset.create({
        data: {
          filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          width,
          height,
          url: `${this.publicUrl}/uploads/media/${filename}`,
          thumbnailUrl,
          storageKey,
          category: metadata.category,
          altText: metadata.altText,
          uploadedBy: userId,
          uploadedByEmail: userEmail,
          tags: metadata.tags,
          tenantId, // Tenant isolation
        },
      });

      return this.formatAsset(asset);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to upload file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * List assets with pagination and filtering
   */
  async listAssets(params: {
    tenantId: string; // Required for tenant isolation
    page: number;
    limit: number;
    category?: string;
    search?: string;
  }): Promise<{ assets: MediaAsset[]; total: number }> {
    const { tenantId, page, limit, category, search } = params;
    const skip = (page - 1) * limit;

    const where: any = { tenantId }; // Always filter by tenant

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { altText: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    const [assets, total] = await Promise.all([
      this.prisma.mediaAsset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.mediaAsset.count({ where }),
    ]);

    return {
      assets: assets.map(asset => this.formatAsset(asset)),
      total,
    };
  }

  /**
   * Get a single asset by ID
   */
  async getAsset(id: string, tenantId: string): Promise<MediaAsset | null> {
    const asset = await this.prisma.mediaAsset.findFirst({
      where: { id, tenantId }, // Tenant isolation
    });

    return asset ? this.formatAsset(asset) : null;
  }

  /**
   * Delete an asset
   */
  async deleteAsset(id: string, tenantId: string): Promise<void> {
    const asset = await this.prisma.mediaAsset.findFirst({
      where: { id, tenantId }, // Tenant isolation
    });

    if (!asset) {
      throw new HttpException('Asset not found', HttpStatus.NOT_FOUND);
    }

    // Delete files from disk
    try {
      const filePath = path.join(this.uploadDir, asset.filename);
      await fs.unlink(filePath);

      if (asset.thumbnailUrl) {
        const thumbnailFilename = asset.thumbnailUrl.split('/').pop();
        if (thumbnailFilename) {
          const thumbnailPath = path.join(this.uploadDir, 'thumbnails', thumbnailFilename);
          await fs.unlink(thumbnailPath);
        }
      }
    } catch (error) {
      mediaLogger.deleteFailed(error as Error);
    }

    // Delete database record
    await this.prisma.mediaAsset.delete({
      where: { id },
    });
  }

  /**
   * Format asset for API response
   */
  private formatAsset(asset: any): MediaAsset {
    return {
      id: asset.id,
      filename: asset.filename,
      originalName: asset.originalName,
      mimeType: asset.mimeType,
      size: asset.size,
      width: asset.width,
      height: asset.height,
      url: asset.url,
      thumbnailUrl: asset.thumbnailUrl,
      category: asset.category,
      altText: asset.altText,
      uploadedBy: asset.uploadedBy,
      uploadedByEmail: asset.uploadedByEmail,
      tags: asset.tags,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
    };
  }

  /**
   * Increment usage count for an asset
   */
  async incrementUsage(id: string, tenantId: string): Promise<void> {
    // First verify the asset belongs to this tenant
    const asset = await this.prisma.mediaAsset.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });

    if (!asset) {
      throw new HttpException('Asset not found or access denied', HttpStatus.NOT_FOUND);
    }

    await this.prisma.mediaAsset.update({
      where: { id },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });
  }
}
