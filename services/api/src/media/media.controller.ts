import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { MediaService } from './media.service';

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

export interface MediaUploadResponse {
  success: boolean;
  asset: MediaAsset;
  message?: string;
}

export interface MediaListResponse {
  success: boolean;
  assets: MediaAsset[];
  total: number;
  page: number;
  limit: number;
}

@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * POST /api/media/upload
   * Upload a media asset (super_admin only)
   */
  @Post('upload')
  @Roles('super_admin')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata: { category?: string; altText?: string; tags?: string },
    @Request() req: any,
  ): Promise<MediaUploadResponse> {
    try {
      if (!file) {
        throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
      }

      const userId = req.user.id;
      const userEmail = req.user.email;

      const tags = metadata.tags ? metadata.tags.split(',').map(t => t.trim()) : [];

      const asset = await this.mediaService.uploadFile(
        file,
        {
          category: metadata.category || 'general',
          altText: metadata.altText,
          tags,
        },
        userId,
        userEmail,
      );

      return {
        success: true,
        asset,
        message: 'File uploaded successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to upload file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/media
   * List all media assets with pagination and filtering
   */
  @Get()
  @Roles('super_admin', 'org_admin')
  async listAssets(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ): Promise<MediaListResponse> {
    try {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;

      const result = await this.mediaService.listAssets({
        page: pageNum,
        limit: limitNum,
        category,
        search,
      });

      return {
        success: true,
        assets: result.assets,
        total: result.total,
        page: pageNum,
        limit: limitNum,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve media assets',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/media/:id
   * Get a specific media asset by ID
   */
  @Get(':id')
  @Roles('super_admin', 'org_admin')
  async getAsset(@Param('id') id: string): Promise<MediaAsset> {
    try {
      const asset = await this.mediaService.getAsset(id);
      if (!asset) {
        throw new HttpException('Asset not found', HttpStatus.NOT_FOUND);
      }
      return asset;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve asset',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * DELETE /api/media/:id
   * Delete a media asset (super_admin only)
   */
  @Delete(':id')
  @Roles('super_admin')
  async deleteAsset(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.mediaService.deleteAsset(id);
      return {
        success: true,
        message: 'Asset deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete asset',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/media/categories
   * Get list of available categories
   */
  @Get('meta/categories')
  @Roles('super_admin', 'org_admin')
  async getCategories(): Promise<string[]> {
    return [
      'avatar',
      'feature-icon',
      'hero-background',
      'blog-image',
      'testimonial-avatar',
      'case-study-image',
      'pricing-icon',
      'general',
    ];
  }
}
