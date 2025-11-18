import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MarketingService } from './marketing.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  MarketingContent,
  MarketingContentUpdateRequest,
  MarketingContentAuditLog,
} from '@repo/types/marketing';

@Controller('marketing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  /**
   * GET /api/marketing/content
   * Retrieve current marketing content (accessible by all authenticated users)
   */
  @Get('content')
  async getContent(): Promise<MarketingContent> {
    try {
      return await this.marketingService.getContent();
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve marketing content',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * PUT /api/marketing/content
   * Update marketing content (super_admin only)
   */
  @Put('content')
  @Roles('super_admin')
  async updateContent(
    @Body() updateRequest: MarketingContentUpdateRequest,
    @Request() req: any,
  ): Promise<MarketingContent> {
    try {
      const userId = req.user.id;
      const userEmail = req.user.email;

      return await this.marketingService.updateContent(
        updateRequest,
        userId,
        userEmail,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update marketing content',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * GET /api/marketing/history
   * Retrieve audit log of marketing content changes (super_admin only)
   */
  @Get('history')
  @Roles('super_admin')
  async getHistory(
    @Request() req: any,
  ): Promise<MarketingContentAuditLog[]> {
    try {
      return await this.marketingService.getHistory();
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve marketing content history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/marketing/version/:id
   * Retrieve a specific version of marketing content (super_admin only)
   */
  @Get('version/:id')
  @Roles('super_admin')
  async getVersion(
    @Request() req: any,
  ): Promise<MarketingContent> {
    try {
      const versionId = req.params.id;
      return await this.marketingService.getVersion(versionId);
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve marketing content version',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * POST /api/marketing/rollback/:id
   * Rollback to a previous version of marketing content (super_admin only)
   */
  @Put('rollback/:id')
  @Roles('super_admin')
  async rollback(
    @Request() req: any,
  ): Promise<MarketingContent> {
    try {
      const versionId = req.params.id;
      const userId = req.user.id;
      const userEmail = req.user.email;

      return await this.marketingService.rollback(versionId, userId, userEmail);
    } catch (error) {
      throw new HttpException(
        'Failed to rollback marketing content',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
