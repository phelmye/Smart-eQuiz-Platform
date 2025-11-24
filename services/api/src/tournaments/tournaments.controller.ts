import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TournamentsService, CreateTournamentDto, UpdateTournamentDto } from './tournaments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditService, AuditAction, AuditResource } from '../audit/audit.service';

@Controller('tournaments')
@UseGuards(JwtAuthGuard)
export class TournamentsController {
  constructor(
    private readonly tournamentsService: TournamentsService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  async create(@Request() req, @Body() createTournamentDto: CreateTournamentDto) {
    const tenantId = req.user.tenantId || 'default';
    const userId = req.user.sub;
    const tournament = await this.tournamentsService.create(tenantId, userId, createTournamentDto);
    
    // Log tournament creation
    await this.auditService.logMutation(
      AuditAction.CREATE,
      userId,
      tenantId,
      AuditResource.TOURNAMENT,
      tournament.id,
      { after: { name: tournament.name, status: tournament.status } },
      req.ip,
    );
    
    return tournament;
  }

  @Get()
  findAll(@Request() req) {
    const tenantId = req.user.tenantId || 'default';
    return this.tournamentsService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId || 'default';
    return this.tournamentsService.findOne(tenantId, id);
  }

  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateTournamentDto: UpdateTournamentDto,
  ) {
    const tenantId = req.user.tenantId || 'default';
    const userId = req.user.sub;
    
    // Get current state before update
    const before = await this.tournamentsService.findOne(tenantId, id);
    const updated = await this.tournamentsService.update(tenantId, id, updateTournamentDto);
    
    // Log tournament update
    await this.auditService.logMutation(
      AuditAction.UPDATE,
      userId,
      tenantId,
      AuditResource.TOURNAMENT,
      id,
      { before: { name: before.name, status: before.status }, after: { name: updated.name, status: updated.status } },
      req.ip,
    );
    
    return updated;
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId || 'default';
    const userId = req.user.sub;
    
    // Get tournament details before deletion
    const tournament = await this.tournamentsService.findOne(tenantId, id);
    const result = await this.tournamentsService.remove(tenantId, id);
    
    // Log tournament deletion
    await this.auditService.logMutation(
      AuditAction.DELETE,
      userId,
      tenantId,
      AuditResource.TOURNAMENT,
      id,
      { before: { name: tournament.name, status: tournament.status } },
      req.ip,
    );
    
    return result;
  }

  @Post(':id/enter')
  enter(@Request() req, @Param('id') tournamentId: string) {
    const userId = req.user.sub;
    return this.tournamentsService.enterTournament(tournamentId, userId);
  }
}
