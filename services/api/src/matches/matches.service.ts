import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

type MatchStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface CreateMatchDto {
  tournamentId: string;
  roundNumber: number;
  scheduledStartTime?: string;
}

export interface JoinMatchDto {
  matchId: string;
}

export interface RecordScoreDto {
  matchId: string;
  score: number;
  answersCorrect: number;
  answersWrong: number;
  totalTimeTaken: number;
}

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async createMatch(tenantId: string, userId: string, dto: CreateMatchDto) {
    // Verify tournament exists and user has permission
    const tournament = await (this.prisma as any).tournament.findFirst({
      where: {
        id: dto.tournamentId,
        tenantId,
      },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    // Check if user is tournament creator or admin
    const userTenant = await (this.prisma as any).userTenant.findFirst({
      where: { userId, tenantId },
      include: { user: true },
    });

    const isAdmin = userTenant?.user?.role === 'SUPER_ADMIN' || 
                    userTenant?.user?.role === 'TENANT_ADMIN' ||
                    tournament.createdBy === userId;

    if (!isAdmin) {
      throw new BadRequestException('Only tournament organizers can create matches');
    }

    // Create the match
    const match = await (this.prisma as any).match.create({
      data: {
        tenantId,
        tournamentId: dto.tournamentId,
        roundNumber: dto.roundNumber,
        status: 'PENDING' as MatchStatus,
        scheduledStartTime: dto.scheduledStartTime ? new Date(dto.scheduledStartTime) : null,
        createdBy: userId,
      },
      include: {
        tournament: { select: { id: true, name: true } },
        _count: { select: { participants: true } },
      },
    });

    return match;
  }

  async findAllMatches(tenantId: string, tournamentId?: string) {
    const where: any = { tenantId };
    if (tournamentId) {
      where.tournamentId = tournamentId;
    }

    return (this.prisma as any).match.findMany({
      where,
      include: {
        tournament: { select: { id: true, name: true } },
        _count: { select: { participants: true } },
      },
      orderBy: [
        { roundNumber: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findMatch(tenantId: string, matchId: string) {
    const match = await (this.prisma as any).match.findFirst({
      where: {
        id: matchId,
        tenantId,
      },
      include: {
        tournament: { select: { id: true, name: true } },
        participants: {
          include: {
            user: { select: { id: true, username: true } },
          },
          orderBy: [
            { rank: 'asc' },
            { score: 'desc' },
          ],
        },
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    return match;
  }

  async joinMatch(tenantId: string, userId: string, dto: JoinMatchDto) {
    // Check if match exists and is joinable
    const match = await (this.prisma as any).match.findFirst({
      where: {
        id: dto.matchId,
        tenantId,
      },
      include: {
        tournament: { select: { maxParticipants: true } },
        _count: { select: { participants: true } },
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.status === 'COMPLETED') {
      throw new BadRequestException('Cannot join completed match');
    }

    // Check if user already joined
    const existingParticipant = await (this.prisma as any).matchParticipant.findFirst({
      where: {
        matchId: dto.matchId,
        userId,
      },
    });

    if (existingParticipant) {
      throw new BadRequestException('Already joined this match');
    }

    // Check participant limit
    if (match.tournament.maxParticipants && 
        match._count.participants >= match.tournament.maxParticipants) {
      throw new BadRequestException('Match is full');
    }

    // Join the match
    const participant = await (this.prisma as any).matchParticipant.create({
      data: {
        matchId: dto.matchId,
        userId,
        score: 0,
        answersCorrect: 0,
        answersWrong: 0,
        totalTimeTaken: 0,
      },
      include: {
        user: { select: { id: true, username: true } },
      },
    });

    // Update match status if first participant
    if (match.status === 'PENDING') {
      await (this.prisma as any).match.update({
        where: { id: dto.matchId },
        data: { 
          status: 'IN_PROGRESS' as MatchStatus,
          actualStartTime: new Date(),
        },
      });
    }

    return participant;
  }

  async recordScore(tenantId: string, userId: string, dto: RecordScoreDto) {
    // Verify match exists
    const match = await (this.prisma as any).match.findFirst({
      where: {
        id: dto.matchId,
        tenantId,
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Match is not in progress');
    }

    // Find participant
    const participant = await (this.prisma as any).matchParticipant.findFirst({
      where: {
        matchId: dto.matchId,
        userId,
      },
    });

    if (!participant) {
      throw new NotFoundException('You are not a participant in this match');
    }

    // Update participant score
    const updatedParticipant = await (this.prisma as any).matchParticipant.update({
      where: { id: participant.id },
      data: {
        score: dto.score,
        answersCorrect: dto.answersCorrect,
        answersWrong: dto.answersWrong,
        totalTimeTaken: dto.totalTimeTaken,
        completedAt: new Date(),
      },
      include: {
        user: { select: { id: true, username: true } },
      },
    });

    // Recalculate ranks for all participants
    await this.updateMatchRankings(dto.matchId);

    return updatedParticipant;
  }

  async updateMatchRankings(matchId: string) {
    // Get all participants sorted by score
    const participants = await (this.prisma as any).matchParticipant.findMany({
      where: { matchId },
      orderBy: [
        { score: 'desc' },
        { totalTimeTaken: 'asc' }, // Tie-breaker: faster time wins
      ],
    });

    // Update ranks
    for (let i = 0; i < participants.length; i++) {
      await (this.prisma as any).matchParticipant.update({
        where: { id: participants[i].id },
        data: { rank: i + 1 },
      });
    }
  }

  async completeMatch(tenantId: string, userId: string, matchId: string) {
    // Verify match exists and user has permission
    const match = await (this.prisma as any).match.findFirst({
      where: {
        id: matchId,
        tenantId,
      },
      include: {
        tournament: true,
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    // Check if user is tournament creator or admin
    const userTenant = await (this.prisma as any).userTenant.findFirst({
      where: { userId, tenantId },
      include: { user: true },
    });

    const isAdmin = userTenant?.user?.role === 'SUPER_ADMIN' || 
                    userTenant?.user?.role === 'TENANT_ADMIN' ||
                    match.tournament.createdBy === userId;

    if (!isAdmin) {
      throw new BadRequestException('Only tournament organizers can complete matches');
    }

    // Update match status
    const updatedMatch = await (this.prisma as any).match.update({
      where: { id: matchId },
      data: {
        status: 'COMPLETED' as MatchStatus,
        actualEndTime: new Date(),
      },
      include: {
        tournament: { select: { id: true, name: true } },
        participants: {
          include: {
            user: { select: { id: true, username: true } },
          },
          orderBy: { rank: 'asc' },
        },
      },
    });

    return updatedMatch;
  }

  async getLeaderboard(tenantId: string, tournamentId: string) {
    // Get all matches for the tournament
    const matches = await (this.prisma as any).match.findMany({
      where: {
        tournamentId,
        tenantId,
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true } },
          },
        },
      },
    });

    // Aggregate scores by user
    const userScores = new Map<string, {
      userId: string;
      username: string;
      totalScore: number;
      matchesPlayed: number;
      wins: number;
    }>();

    for (const match of matches) {
      for (const participant of match.participants) {
        const key = participant.userId;
        const existing = userScores.get(key) || {
          userId: participant.user.id,
          username: participant.user.username,
          totalScore: 0,
          matchesPlayed: 0,
          wins: 0,
        };

        existing.totalScore += participant.score;
        existing.matchesPlayed += 1;
        if (participant.rank === 1) {
          existing.wins += 1;
        }

        userScores.set(key, existing);
      }
    }

    // Convert to array and sort by total score
    const leaderboard = Array.from(userScores.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((entry, index) => ({
        rank: index + 1,
        ...entry,
      }));

    return leaderboard;
  }
}
