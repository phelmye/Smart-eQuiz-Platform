import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  Patch,
} from '@nestjs/common';
import {
  MatchesService,
  CreateMatchDto,
  JoinMatchDto,
  RecordScoreDto,
} from './matches.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  createMatch(@Request() req, @Body() dto: CreateMatchDto) {
    const { tenantId, userId } = req.user;
    return this.matchesService.createMatch(tenantId, userId, dto);
  }

  @Get()
  findAllMatches(
    @Request() req,
    @Query('tournamentId') tournamentId?: string,
  ) {
    const { tenantId } = req.user;
    return this.matchesService.findAllMatches(tenantId, tournamentId);
  }

  @Get(':id')
  findMatch(@Request() req, @Param('id') id: string) {
    const { tenantId } = req.user;
    return this.matchesService.findMatch(tenantId, id);
  }

  @Post('join')
  joinMatch(@Request() req, @Body() dto: JoinMatchDto) {
    const { tenantId, userId } = req.user;
    return this.matchesService.joinMatch(tenantId, userId, dto);
  }

  @Post('score')
  recordScore(@Request() req, @Body() dto: RecordScoreDto) {
    const { tenantId, userId } = req.user;
    return this.matchesService.recordScore(tenantId, userId, dto);
  }

  @Patch(':id/complete')
  completeMatch(@Request() req, @Param('id') id: string) {
    const { tenantId, userId } = req.user;
    return this.matchesService.completeMatch(tenantId, userId, id);
  }

  @Get('leaderboard/:tournamentId')
  getLeaderboard(@Request() req, @Param('tournamentId') tournamentId: string) {
    const { tenantId } = req.user;
    return this.matchesService.getLeaderboard(tenantId, tournamentId);
  }
}
