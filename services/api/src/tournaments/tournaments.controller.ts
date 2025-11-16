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

@Controller('tournaments')
@UseGuards(JwtAuthGuard)
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Post()
  create(@Request() req, @Body() createTournamentDto: CreateTournamentDto) {
    const tenantId = req.user.tenantId || 'default';
    const userId = req.user.sub;
    return this.tournamentsService.create(tenantId, userId, createTournamentDto);
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
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateTournamentDto: UpdateTournamentDto,
  ) {
    const tenantId = req.user.tenantId || 'default';
    return this.tournamentsService.update(tenantId, id, updateTournamentDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId || 'default';
    return this.tournamentsService.remove(tenantId, id);
  }

  @Post(':id/enter')
  enter(@Request() req, @Param('id') tournamentId: string) {
    const userId = req.user.sub;
    return this.tournamentsService.enterTournament(tournamentId, userId);
  }
}
