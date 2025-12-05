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
import { AuditService, AuditAction, AuditResource } from '../audit/audit.service';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

@Controller('questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly auditService: AuditService,
  ) {}

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
  async create(@Request() req, @Body() createQuestionDto: CreateQuestionDto) {
    const tenantId = req.user.tenantId || 'default';
    const userId = req.user.sub;
    const question = await this.questionsService.create(tenantId, userId, createQuestionDto);
    
    // Log question creation
    await this.auditService.logMutation(
      AuditAction.CREATE,
      userId,
      tenantId,
      AuditResource.QUESTION,
      question.id,
      { after: { text: question.prompt, difficulty: question.difficulty } },
      req.ip,
    );
    
    return question;
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
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    const tenantId = req.user.tenantId || 'default';
    const userId = req.user.sub;
    
    // Get current state before update
    const before = await this.questionsService.findOne(tenantId, id);
    const updated = await this.questionsService.update(tenantId, id, updateQuestionDto);
    
    // Log question update
    await this.auditService.logMutation(
      AuditAction.UPDATE,
      userId,
      tenantId,
      AuditResource.QUESTION,
      id,
      { before: { text: before.prompt, difficulty: before.difficulty }, after: { text: updated.prompt, difficulty: updated.difficulty } },
      req.ip,
    );
    
    return updated;
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId || 'default';
    const userId = req.user.sub;
    
    // Get question details before deletion
    const question = await this.questionsService.findOne(tenantId, id);
    const result = await this.questionsService.remove(tenantId, id);
    
    // Log question deletion
    await this.auditService.logMutation(
      AuditAction.DELETE,
      userId,
      tenantId,
      AuditResource.QUESTION,
      id,
      { before: { text: question.prompt, difficulty: question.difficulty } },
      req.ip,
    );
    
    return result;
  }
}
