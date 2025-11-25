import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { LandingPageService } from './landing-page.service';
import {
  CreateLandingPageContentDto,
  LandingPageSection,
} from './dto/create-landing-page-content.dto';
import { UpdateLandingPageContentDto } from './dto/update-landing-page-content.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { TenantId } from '../common/tenant-id.decorator';

@Controller('landing-page')
@UseGuards(JwtAuthGuard, TenantGuard)
export class LandingPageController {
  constructor(private readonly landingPageService: LandingPageService) {}

  /**
   * Create new landing page content version (Admin only)
   * POST /api/landing-page
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('ORG_ADMIN', 'QUESTION_MANAGER')
  create(
    @TenantId() tenantId: string,
    @Request() req,
    @Body() createDto: CreateLandingPageContentDto,
  ) {
    return this.landingPageService.create(tenantId, req.user.id, createDto);
  }

  /**
   * Update landing page content (creates new version) (Admin only)
   * PUT /api/landing-page/:id
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('ORG_ADMIN', 'QUESTION_MANAGER')
  update(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Request() req,
    @Body() updateDto: UpdateLandingPageContentDto,
  ) {
    return this.landingPageService.update(id, tenantId, req.user.id, updateDto);
  }

  /**
   * Get all versions for a section (Admin only)
   * GET /api/landing-page/section/:section/versions
   */
  @Get('section/:section/versions')
  @UseGuards(RolesGuard)
  @Roles('ORG_ADMIN', 'QUESTION_MANAGER')
  findAllVersions(
    @Param('section') section: LandingPageSection,
    @TenantId() tenantId: string,
  ) {
    return this.landingPageService.findAllVersions(tenantId, section);
  }

  /**
   * Get active content for a specific section (Public)
   * GET /api/landing-page/section/:section/active
   */
  @Get('section/:section/active')
  getActive(
    @Param('section') section: LandingPageSection,
    @TenantId() tenantId: string,
  ) {
    return this.landingPageService.getActive(tenantId, section);
  }

  /**
   * Get all active content for all sections (Public - used by landing page)
   * GET /api/landing-page/active
   */
  @Get('active')
  getAllActive(@TenantId() tenantId: string) {
    return this.landingPageService.getAllActive(tenantId);
  }

  /**
   * Activate a specific version (Admin only)
   * POST /api/landing-page/:id/activate
   */
  @Post(':id/activate')
  @UseGuards(RolesGuard)
  @Roles('ORG_ADMIN', 'QUESTION_MANAGER')
  activate(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.landingPageService.activate(id, tenantId);
  }

  /**
   * Deactivate a specific version (Admin only)
   * POST /api/landing-page/:id/deactivate
   */
  @Post(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles('ORG_ADMIN', 'QUESTION_MANAGER')
  deactivate(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.landingPageService.deactivate(id, tenantId);
  }

  /**
   * Get version history for a section (Admin only)
   * GET /api/landing-page/section/:section/history
   */
  @Get('section/:section/history')
  @UseGuards(RolesGuard)
  @Roles('ORG_ADMIN', 'QUESTION_MANAGER')
  getHistory(
    @Param('section') section: LandingPageSection,
    @TenantId() tenantId: string,
  ) {
    return this.landingPageService.getHistory(tenantId, section);
  }

  /**
   * Get specific version by ID (Admin only)
   * GET /api/landing-page/:id
   */
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ORG_ADMIN', 'QUESTION_MANAGER')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.landingPageService.findOne(id, tenantId);
  }

  /**
   * Delete a specific version (Admin only)
   * DELETE /api/landing-page/:id
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ORG_ADMIN', 'QUESTION_MANAGER')
  delete(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.landingPageService.delete(id, tenantId);
  }
}
