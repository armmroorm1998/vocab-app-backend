import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationQuizController } from './conversation-quiz.controller';
import { ConversationQuizService } from './conversation-quiz.service';
import {
  ConversationQuizCategory,
  ConversationQuizQuestion,
} from './conversation-quiz.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConversationQuizCategory,
      ConversationQuizQuestion,
    ]),
  ],
  controllers: [ConversationQuizController],
  providers: [ConversationQuizService],
})
export class ConversationQuizModule {}
