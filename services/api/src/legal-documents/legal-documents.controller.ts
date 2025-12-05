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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { LegalDocumentsService } from './legal-documents.service';
import { CreateLegalDocumentDto } from './dto/create-legal-document.dto';
import { UpdateLegalDocumentDto } from './dto/update-legal-document.dto';
import { AcceptLegalDocumentDto } from './dto/accept-legal-document.dto';
import { Role, LegalDocumentType } from '@prisma/client';

@Controller('legal-documents')
@UseGuards(JwtAuthGuard, TenantGuard)
export class LegalDocumentsController {
  constructor(private readonly legalDocumentsService: LegalDocumentsService) {}

  /**
   * Create a new legal document (admin only)
   * POST /legal-documents
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ORG_ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @TenantId() tenantId: string,
    @Request() req,
    @Body() createDto: CreateLegalDocumentDto,
  ) {
    return this.legalDocumentsService.create(tenantId, req.user.userId, createDto);
  }

  /**
   * Update legal document (creates new version)
   * PUT /legal-documents/:id
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ORG_ADMIN, Role.SUPER_ADMIN)
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Request() req,
    @Body() updateDto: UpdateLegalDocumentDto,
  ) {
    return this.legalDocumentsService.update(tenantId, id, req.user.userId, updateDto);
  }

  /**
   * Activate a specific document version
   * POST /legal-documents/:id/activate
   */
  @Post(':id/activate')
  @UseGuards(RolesGuard)
  @Roles(Role.ORG_ADMIN, Role.SUPER_ADMIN)
  async activate(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.legalDocumentsService.activate(tenantId, id);
  }

  /**
   * Get active version of a document type
   * GET /legal-documents/active/:type
   */
  @Get('active/:type')
  async getActive(
    @TenantId() tenantId: string,
    @Param('type') type: LegalDocumentType,
  ) {
    return this.legalDocumentsService.getActive(tenantId, type);
  }

  /**
   * Get all active documents for tenant
   * GET /legal-documents/active
   */
  @Get('active')
  async getAllActive(@TenantId() tenantId: string) {
    return this.legalDocumentsService.getAllForTenant(tenantId);
  }

  /**
   * Get version history for a document type
   * GET /legal-documents/history/:type
   */
  @Get('history/:type')
  @UseGuards(RolesGuard)
  @Roles(Role.ORG_ADMIN, Role.SUPER_ADMIN)
  async getHistory(
    @TenantId() tenantId: string,
    @Param('type') type: LegalDocumentType,
  ) {
    return this.legalDocumentsService.getVersionHistory(tenantId, type);
  }

  /**
   * Get specific document by ID
   * GET /legal-documents/:id
   */
  @Get(':id')
  async getById(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.legalDocumentsService.getById(tenantId, id);
  }

  /**
   * Accept a legal document (current user)
   * POST /legal-documents/accept
   */
  @Post('accept')
  @HttpCode(HttpStatus.OK)
  async acceptDocument(
    @Request() req,
    @Body() acceptDto: AcceptLegalDocumentDto,
  ) {
    return this.legalDocumentsService.acceptDocument(req.user.userId, acceptDto);
  }

  /**
   * Get current user's acceptance status
   * GET /legal-documents/my-acceptances
   */
  @Get('my-acceptances')
  async getMyAcceptances(
    @TenantId() tenantId: string,
    @Request() req,
  ) {
    return this.legalDocumentsService.getUserAcceptanceStatus(req.user.userId, tenantId);
  }

  /**
   * Delete a document version (admin only)
   * DELETE /legal-documents/:id
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ORG_ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.legalDocumentsService.delete(tenantId, id);
  }
}
