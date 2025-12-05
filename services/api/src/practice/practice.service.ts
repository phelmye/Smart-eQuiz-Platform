import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface StartPracticeDto {
  categoryId?: string;
}

export interface AnswerQuestionDto {
  questionId: string;
  isCorrect: boolean;
  timeSpent: number; // seconds
}

@Injectable()
export class PracticeService {
  constructor(private prisma: PrismaService) {}

  async startPractice(userId: string, dto: StartPracticeDto) {
    // Get or create practice progress
    let progress = await this.prisma.practiceProgress.findUnique({
      where: {
        userId_categoryId: {
          userId,
          categoryId: dto.categoryId || null,
        },
      },
    });

    if (!progress) {
      progress = await this.prisma.practiceProgress.create({
        data: {
          userId,
          categoryId: dto.categoryId,
          totalXp: 0,
          currentLevel: 1,
          questionsAnswered: 0,
          correctAnswers: 0,
          currentStreak: 0,
          longestStreak: 0,
        },
      });
    }

    // Get a random question from the category (or any category if not specified)
    const where: any = { isActive: true };
    if (dto.categoryId) {
      where.categoryId = dto.categoryId;
    }

    const questions = await this.prisma.question.findMany({
      where,
      select: {
        id: true,
        prompt: true,
        wrongAnswers: true,
        difficulty: true,
        points: true,
        timeLimit: true,
        category: { select: { id: true, name: true } },
      },
      take: 10, // Get 10 random questions
    });

    // Shuffle and return first question
    const shuffled = questions.sort(() => Math.random() - 0.5);

    return {
      progress: {
        id: progress.id,
        totalXp: progress.totalXp,
        currentLevel: progress.currentLevel,
        questionsAnswered: progress.questionsAnswered,
        correctAnswers: progress.correctAnswers,
        currentStreak: progress.currentStreak,
        longestStreak: progress.longestStreak,
      },
      questions: shuffled,
    };
  }

  async answerQuestion(
    userId: string,
    progressId: string,
    dto: AnswerQuestionDto,
  ) {
    const progress = await this.prisma.practiceProgress.findUnique({
      where: { id: progressId },
    });

    if (!progress || progress.userId !== userId) {
      throw new Error('Invalid progress ID');
    }

    const question = await this.prisma.question.findUnique({
      where: { id: dto.questionId },
    });

    if (!question) {
      throw new Error('Question not found');
    }

    // Calculate XP earned
    let xpEarned = 0;
    if (dto.isCorrect) {
      xpEarned = question.points;
      // Bonus for speed (if answered in < 50% of time limit)
      if (dto.timeSpent < question.timeLimit / 2) {
        xpEarned = Math.floor(xpEarned * 1.5);
      }
    }

    // Update streak
    const newStreak = dto.isCorrect ? progress.currentStreak + 1 : 0;
    const newLongestStreak = Math.max(newStreak, progress.longestStreak);

    // Calculate new level (every 100 XP = 1 level)
    const newTotalXp = progress.totalXp + xpEarned;
    const newLevel = Math.floor(newTotalXp / 100) + 1;

    // Record the answer
    await this.prisma.practiceAnswer.create({
      data: {
        progressId: progress.id,
        questionId: dto.questionId,
        isCorrect: dto.isCorrect,
        timeSpent: dto.timeSpent,
        xpEarned,
      },
    });

    // Update progress
    const updatedProgress = await this.prisma.practiceProgress.update({
      where: { id: progressId },
      data: {
        totalXp: newTotalXp,
        currentLevel: newLevel,
        questionsAnswered: { increment: 1 },
        correctAnswers: dto.isCorrect
          ? { increment: 1 }
          : progress.correctAnswers,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastPracticeAt: new Date(),
      },
    });

    return {
      correct: dto.isCorrect,
      xpEarned,
      newStreak,
      leveledUp: newLevel > progress.currentLevel,
      progress: {
        totalXp: updatedProgress.totalXp,
        currentLevel: updatedProgress.currentLevel,
        questionsAnswered: updatedProgress.questionsAnswered,
        correctAnswers: updatedProgress.correctAnswers,
        currentStreak: updatedProgress.currentStreak,
        longestStreak: updatedProgress.longestStreak,
      },
    };
  }

  async getPracticeStats(userId: string, categoryId?: string) {
    const progress = await this.prisma.practiceProgress.findFirst({
      where: {
        userId,
        categoryId: categoryId || null,
      },
      include: {
        answers: {
          orderBy: { answeredAt: 'desc' },
          take: 10,
          include: {
            question: {
              select: {
                id: true,
                prompt: true,
                difficulty: true,
                category: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!progress) {
      return {
        totalXp: 0,
        currentLevel: 1,
        questionsAnswered: 0,
        correctAnswers: 0,
        accuracy: 0,
        currentStreak: 0,
        longestStreak: 0,
        recentAnswers: [],
      };
    }

    const accuracy =
      progress.questionsAnswered > 0
        ? (progress.correctAnswers / progress.questionsAnswered) * 100
        : 0;

    return {
      totalXp: progress.totalXp,
      currentLevel: progress.currentLevel,
      questionsAnswered: progress.questionsAnswered,
      correctAnswers: progress.correctAnswers,
      accuracy: Math.round(accuracy * 10) / 10,
      currentStreak: progress.currentStreak,
      longestStreak: progress.longestStreak,
      lastPracticeAt: progress.lastPracticeAt,
      recentAnswers: progress.answers,
    };
  }

  async getLeaderboard(categoryId?: string, limit: number = 10) {
    const where: any = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const topPlayers = await this.prisma.practiceProgress.findMany({
      where,
      orderBy: [{ totalXp: 'desc' }, { currentLevel: 'desc' }],
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return topPlayers.map((p, index) => ({
      rank: index + 1,
      userId: p.userId,
      userEmail: p.user.email,
      totalXp: p.totalXp,
      level: p.currentLevel,
      questionsAnswered: p.questionsAnswered,
      accuracy:
        p.questionsAnswered > 0
          ? Math.round((p.correctAnswers / p.questionsAnswered) * 1000) / 10
          : 0,
      longestStreak: p.longestStreak,
    }));
  }
}
