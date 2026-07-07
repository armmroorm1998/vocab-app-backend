import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationQuizController } from './conversation-quiz.controller';
import { ConversationQuizService } from './conversation-quiz.service';
import { ConversationQuizAttemptService } from './conversation-quiz-attempt.service';
import {
  ConversationQuizCategory,
  ConversationQuizQuestion,
} from './conversation-quiz.entity';
import { ConversationQuizAttempt } from './conversation-quiz-attempt.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConversationQuizCategory,
      ConversationQuizQuestion,
      ConversationQuizAttempt,
    ]),
    UserModule,
  ],
  controllers: [ConversationQuizController],
  providers: [ConversationQuizService, ConversationQuizAttemptService],
})
export class ConversationQuizModule {}
