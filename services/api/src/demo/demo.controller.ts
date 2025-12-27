import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DemoService, CreateDemoTemplateDto, UpdateDemoTemplateDto } from './demo.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  // ============================================
  // Platform Admin Endpoints
  // ============================================

  /**
   * Create new demo template
   * POST /api/demo/templates
   */
  @Post('templates')
  @UseGuards(JwtAuthGuard)
  async createTemplate(@Body() dto: CreateDemoTemplateDto, @Request() req) {
    return this.demoService.createTemplate({
      ...dto,
      createdBy: req.user.userId,
    });
  }

  /**
   * Get all demo templates
   * GET /api/demo/templates
   */
  @Get('templates')
  @UseGuards(JwtAuthGuard)
  async listTemplates() {
    return this.demoService.listTemplates();
  }

  /**
   * Get single template
   * GET /api/demo/templates/:id
   */
  @Get('templates/:id')
  @UseGuards(JwtAuthGuard)
  async getTemplate(@Param('id') id: string) {
    return this.demoService.getTemplate(id);
  }

  /**
   * Update template
   * PUT /api/demo/templates/:id
   */
  @Put('templates/:id')
  @UseGuards(JwtAuthGuard)
  async updateTemplate(@Param('id') id: string, @Body() dto: UpdateDemoTemplateDto) {
    return this.demoService.updateTemplate(id, dto);
  }

  /**
   * Activate template
   * POST /api/demo/templates/:id/activate
   */
  @Post('templates/:id/activate')
  @UseGuards(JwtAuthGuard)
  async activateTemplate(@Param('id') id: string) {
    return this.demoService.activateTemplate(id);
  }

  /**
   * Delete template
   * DELETE /api/demo/templates/:id
   */
  @Delete('templates/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTemplate(@Param('id') id: string) {
    return this.demoService.deleteTemplate(id);
  }

  /**
   * Get demo analytics
   * GET /api/demo/analytics
   */
  @Get('analytics')
  @UseGuards(JwtAuthGuard)
  async getAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.demoService.getAnalytics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * Force cleanup expired sessions
   * POST /api/demo/cleanup
   */
  @Post('cleanup')
  @UseGuards(JwtAuthGuard)
  async forceCleanup() {
    return this.demoService.forceCleanup();
  }

  // ============================================
  // Public Demo Endpoints (No Auth Required)
  // ============================================

  /**
   * Get or create demo session
   * POST /api/demo/session
   */
  @Post('session')
  async getOrCreateSession(
    @Body() body: { sessionToken?: string },
    @Request() req,
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.demoService.getOrCreateSession(
      body.sessionToken,
      ipAddress,
      userAgent,
    );
  }

  /**
   * Get session data
   * GET /api/demo/session/:token
   */
  @Get('session/:token')
  async getSessionData(@Param('token') token: string) {
    return this.demoService.getSessionData(token);
  }

  /**
   * Update session changes
   * PUT /api/demo/session/:token
   */
  @Put('session/:token')
  async updateSession(
    @Param('token') token: string,
    @Body() body: { changes: any },
  ) {
    return this.demoService.updateSessionChanges(token, body.changes);
  }

  /**
   * Track demo event
   * POST /api/demo/track
   */
  @Post('track')
  @HttpCode(HttpStatus.NO_CONTENT)
  async trackEvent(
    @Body() body: {
      sessionId: string;
      eventType: string;
      featureName: string;
      metadata?: any;
    },
  ) {
    await this.demoService.trackEvent(
      body.sessionId,
      body.eventType,
      body.featureName,
      body.metadata,
    );
  }
}
