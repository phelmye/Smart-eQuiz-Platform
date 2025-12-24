import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { SupportService } from './support.service';

@ApiTags('Support')
@Controller('support')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('tickets')
  @Roles('super_admin', 'org_admin')
  @ApiOperation({ summary: 'Get all support tickets (super_admin sees all, org_admin sees tenant tickets)' })
  async getTickets(
    @Query('tenantId') tenantId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('category') category?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Request() req?: any,
  ) {
    const user = req.user;
    
    // If not super_admin, filter by user's tenant
    const filterTenantId = user.role === 'super_admin' ? tenantId : user.tenantId;

    return this.supportService.getTickets({
      tenantId: filterTenantId,
      status,
      priority,
      category,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  @Get('tickets/:id')
  @Roles('super_admin', 'org_admin')
  @ApiOperation({ summary: 'Get ticket details' })
  async getTicket(@Param('id') id: string, @Request() req?: any) {
    return this.supportService.getTicket(id, req.user);
  }

  @Post('tickets')
  @ApiOperation({ summary: 'Create a new support ticket' })
  async createTicket(@Body() data: any, @Request() req?: any) {
    return this.supportService.createTicket({
      ...data,
      userId: req.user.id,
      tenantId: req.user.tenantId,
    });
  }

  @Put('tickets/:id')
  @Roles('super_admin', 'org_admin')
  @ApiOperation({ summary: 'Update ticket status/assignment' })
  async updateTicket(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req?: any,
  ) {
    return this.supportService.updateTicket(id, data, req.user);
  }

  @Post('tickets/:id/messages')
  @ApiOperation({ summary: 'Add message to ticket' })
  async addMessage(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req?: any,
  ) {
    return this.supportService.addMessage(id, {
      ...data,
      userId: req.user.id,
    });
  }

  @Get('stats')
  @Roles('super_admin', 'org_admin')
  @ApiOperation({ summary: 'Get support statistics' })
  async getStats(@Request() req?: any) {
    const user = req.user;
    const tenantId = user.role === 'super_admin' ? undefined : user.tenantId;
    return this.supportService.getStats(tenantId);
  }
}
