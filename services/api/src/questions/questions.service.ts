import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface CreateQuestionDto {
  categoryId: string;
  prompt: string;
  correctAnswer: string;
  wrongAnswers: string[];
  difficulty?: Difficulty;
  points?: number;
  timeLimit?: number;
  explanation?: string;
}

export interface UpdateQuestionDto {
  categoryId?: string;
  prompt?: string;
  correctAnswer?: string;
  wrongAnswers?: string[];
  difficulty?: Difficulty;
  points?: number;
  timeLimit?: number;
  explanation?: string;
  isActive?: boolean;
}

export interface CreateCategoryDto {
  name: string;
}

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  // Categories
  async createCategory(tenantId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        name: dto.name,
        tenantId,
      },
    });
  }

  async findCategories(tenantId: string) {
    return this.prisma.category.findMany({
      where: { tenantId },
      include: {
        _count: { select: { questions: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  // Questions
  async create(tenantId: string, userId: string, dto: CreateQuestionDto) {
    return this.prisma.question.create({
      data: {
        tenantId,
        categoryId: dto.categoryId,
        prompt: dto.prompt,
        correctAnswer: dto.correctAnswer,
        wrongAnswers: dto.wrongAnswers,
        difficulty: dto.difficulty || 'MEDIUM' as Difficulty,
        points: dto.points || 10,
        timeLimit: dto.timeLimit || 30,
        explanation: dto.explanation,
        createdBy: userId,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });
  }

  async findAll(
    tenantId: string,
    filters?: {
      categoryId?: string;
      difficulty?: Difficulty;
      isActive?: boolean;
    },
  ) {
    const where: any = { tenantId };
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.difficulty) where.difficulty = filters.difficulty;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    return this.prisma.question.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.question.findFirst({
      where: { id, tenantId },
      include: {
        category: { select: { id: true, name: true } },
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateQuestionDto) {
    const updateData: any = {};
    if (dto.categoryId) updateData.categoryId = dto.categoryId;
    if (dto.prompt) updateData.prompt = dto.prompt;
    if (dto.correctAnswer) updateData.correctAnswer = dto.correctAnswer;
    if (dto.wrongAnswers) updateData.wrongAnswers = dto.wrongAnswers;
    if (dto.difficulty) updateData.difficulty = dto.difficulty;
    if (dto.points !== undefined) updateData.points = dto.points;
    if (dto.timeLimit !== undefined) updateData.timeLimit = dto.timeLimit;
    if (dto.explanation !== undefined) updateData.explanation = dto.explanation;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    return this.prisma.question.update({
      where: { id, tenantId },
      data: updateData,
      include: {
        category: { select: { id: true, name: true } },
      },
    });
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.question.delete({
      where: { id, tenantId },
    });
  }
}
