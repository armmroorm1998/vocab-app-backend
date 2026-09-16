import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ConversationQuizService } from './conversation-quiz.service';
import { ConversationQuizAttemptService } from './conversation-quiz-attempt.service';
import {
  ConversationQuizQueryDto,
  SubmitAnswerDto,
  HistoryQueryDto,
  CreateConversationCategoryDto,
  UpdateConversationCategoryDto,
  CreateConversationQuestionDto,
  UpdateConversationQuestionDto,
} from './conversation-quiz.dto';
import { UidAuthGuard } from '../user/uid-auth.guard';
import { AdminGuard } from '../user/admin.guard';
import { CurrentUser } from '../user/current-user.decorator';
import { User } from '../user/user.entity';

@Controller('conversation-quiz')
export class ConversationQuizController {
  constructor(
    private readonly service: ConversationQuizService,
    private readonly attemptService: ConversationQuizAttemptService,
  ) {}

  @Get('categories')
  async getCategories() {
    const data = await this.service.getCategories();
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total: data.length,
      body: data,
    };
  }

  @Get('questions')
  async getQuestions(@Query() query: ConversationQuizQueryDto) {
    const data = await this.service.getQuestions(query);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total: data.length,
      body: data,
    };
  }

  @Get('history')
  @UseGuards(UidAuthGuard)
  async getHistory(@CurrentUser() user: User, @Query() query: HistoryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { data, total } = await this.attemptService.getHistory(
      user.id,
      page,
      limit,
    );
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total,
      page,
      limit,
      body: data,
    };
  }

  @Get('stats')
  @UseGuards(UidAuthGuard)
  async getStats(@CurrentUser() user: User) {
    const data = await this.attemptService.getStats(user.id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total: null,
      body: data,
    };
  }

  @Post('categories')
  @UseGuards(AdminGuard)
  async createCategory(@Body() dto: CreateConversationCategoryDto) {
    const data = await this.service.createCategory(dto);
    return {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Category created',
      total: null,
      body: data,
    };
  }

  @Put('categories/:id')
  @UseGuards(AdminGuard)
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConversationCategoryDto,
  ) {
    const data = await this.service.updateCategory(id, dto);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Category updated',
      total: null,
      body: data,
    };
  }

  @Delete('categories/:id')
  @UseGuards(AdminGuard)
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    await this.service.deleteCategory(id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Category deleted',
      total: null,
      body: null,
    };
  }

  @Post('questions')
  @UseGuards(AdminGuard)
  async createQuestion(@Body() dto: CreateConversationQuestionDto) {
    const data = await this.service.createQuestion(dto);
    return {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Question created',
      total: null,
      body: data,
    };
  }

  @Put('questions/:id')
  @UseGuards(AdminGuard)
  async updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConversationQuestionDto,
  ) {
    const data = await this.service.updateQuestion(id, dto);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Question updated',
      total: null,
      body: data,
    };
  }

  @Delete('questions/:id')
  @UseGuards(AdminGuard)
  async deleteQuestion(@Param('id', ParseIntPipe) id: number) {
    await this.service.deleteQuestion(id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Question deleted',
      total: null,
      body: null,
    };
  }

  @Post('questions/:id/submit')
  @UseGuards(UidAuthGuard)
  async submitAnswer(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body() dto: SubmitAnswerDto,
  ) {
    const data = await this.attemptService.submitAnswer(
      user.id,
      id,
      dto.selectedChoice,
    );
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total: null,
      body: data,
    };
  }
}
