import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  PracticeService,
  StartPracticeDto,
  AnswerQuestionDto,
} from './practice.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('practice')
@UseGuards(JwtAuthGuard)
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Post('start')
  startPractice(@Request() req, @Body() dto: StartPracticeDto) {
    const userId = req.user.userId;
    return this.practiceService.startPractice(userId, dto);
  }

  @Post('answer')
  answerQuestion(
    @Request() req,
    @Body() body: { progressId: string; answer: AnswerQuestionDto },
  ) {
    const userId = req.user.userId;
    return this.practiceService.answerQuestion(
      userId,
      body.progressId,
      body.answer,
    );
  }

  @Get('stats')
  getPracticeStats(@Request() req, @Query('categoryId') categoryId?: string) {
    const userId = req.user.userId;
    return this.practiceService.getPracticeStats(userId, categoryId);
  }

  @Get('leaderboard')
  getLeaderboard(
    @Query('categoryId') categoryId?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.practiceService.getLeaderboard(categoryId, limitNum);
  }
}
