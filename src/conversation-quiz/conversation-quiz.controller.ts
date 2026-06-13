import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ConversationQuizService } from './conversation-quiz.service';
import { ConversationQuizQueryDto } from './conversation-quiz.dto';

@Controller('conversation-quiz')
export class ConversationQuizController {
  constructor(private readonly service: ConversationQuizService) {}

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
}
