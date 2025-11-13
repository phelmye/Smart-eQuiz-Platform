import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TournamentStatus } from '@prisma/client';

export interface CreateTournamentDto {
  name: string;
  description?: string;
  entryFee?: number;
  prizePool?: number;
  maxParticipants?: number;
  startDate: string;
  endDate: string;
  questionIds?: string[];
}

export interface UpdateTournamentDto {
  name?: string;
  description?: string;
  status?: TournamentStatus;
  entryFee?: number;
  prizePool?: number;
  maxParticipants?: number;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class TournamentsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateTournamentDto) {
    const tournament = await this.prisma.tournament.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        entryFee: dto.entryFee || 0,
        prizePool: dto.prizePool || 0,
        maxParticipants: dto.maxParticipants || 50,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        createdBy: userId,
        status: TournamentStatus.DRAFT,
      },
      include: {
        tenant: { select: { id: true, name: true } },
      },
    });

    // Attach questions if provided
    if (dto.questionIds && dto.questionIds.length > 0) {
      await this.prisma.tournamentQuestion.createMany({
        data: dto.questionIds.map((qId, index) => ({
          tournamentId: tournament.id,
          questionId: qId,
          orderIndex: index,
        })),
      });
    }

    return tournament;
  }

  async findAll(tenantId: string) {
    return this.prisma.tournament.findMany({
      where: { tenantId },
      include: {
        tenant: { select: { id: true, name: true } },
        _count: {
          select: {
            questions: true,
            entries: true,
            matches: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.tournament.findFirst({
      where: { id, tenantId },
      include: {
        tenant: { select: { id: true, name: true } },
        questions: {
          include: {
            question: {
              select: {
                id: true,
                prompt: true,
                difficulty: true,
                points: true,
                category: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        entries: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
        _count: { select: { matches: true } },
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateTournamentDto) {
    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.status) updateData.status = dto.status;
    if (dto.entryFee !== undefined) updateData.entryFee = dto.entryFee;
    if (dto.prizePool !== undefined) updateData.prizePool = dto.prizePool;
    if (dto.maxParticipants) updateData.maxParticipants = dto.maxParticipants;
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);

    return this.prisma.tournament.update({
      where: { id, tenantId },
      data: updateData,
      include: {
        tenant: { select: { id: true, name: true } },
      },
    });
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.tournament.delete({
      where: { id, tenantId },
    });
  }

  async enterTournament(tournamentId: string, userId: string) {
    return this.prisma.tournamentEntry.create({
      data: {
        tournamentId,
        userId,
        isPaid: false,
      },
    });
  }
}
