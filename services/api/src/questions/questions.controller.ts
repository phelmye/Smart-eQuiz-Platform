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
  Query,
} from '@nestjs/common';
import {
  QuestionsService,
  CreateQuestionDto,
  UpdateQuestionDto,
  CreateCategoryDto,
} from './questions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

@Controller('questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  // Categories
  @Post('categories')
  createCategory(@Request() req, @Body() dto: CreateCategoryDto) {
    const tenantId = req.user.tenantId || 'default';
    return this.questionsService.createCategory(tenantId, dto);
  }

  @Get('categories')
  findCategories(@Request() req) {
    const tenantId = req.user.tenantId || 'default';
    return this.questionsService.findCategories(tenantId);
  }

  // Questions
  @Post()
  create(@Request() req, @Body() createQuestionDto: CreateQuestionDto) {
    const tenantId = req.user.tenantId || 'default';
    const userId = req.user.sub;
    return this.questionsService.create(tenantId, userId, createQuestionDto);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('categoryId') categoryId?: string,
    @Query('difficulty') difficulty?: Difficulty,
    @Query('isActive') isActive?: string,
  ) {
    const tenantId = req.user.tenantId || 'default';
    const filters: any = {};
    if (categoryId) filters.categoryId = categoryId;
    if (difficulty) filters.difficulty = difficulty;
    if (isActive !== undefined)
      filters.isActive = isActive === 'true' || isActive === '1';

    return this.questionsService.findAll(tenantId, filters);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId || 'default';
    return this.questionsService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    const tenantId = req.user.tenantId || 'default';
    return this.questionsService.update(tenantId, id, updateQuestionDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId || 'default';
    return this.questionsService.remove(tenantId, id);
  }
}
