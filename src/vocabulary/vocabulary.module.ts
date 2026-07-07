import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vocabulary, VocabularyExample } from './vocabulary.entity';
import { VocabularyProgress } from './vocabulary-progress.entity';
import { VocabularyBookmark } from './vocabulary-bookmark.entity';
import { VocabularyQuizAttempt } from './vocabulary-quiz-attempt.entity';
import { VocabularyService } from './vocabulary.service';
import { VocabularyProgressService } from './vocabulary-progress.service';
import { VocabularyBookmarkService } from './vocabulary-bookmark.service';
import { VocabularyQuizAttemptService } from './vocabulary-quiz-attempt.service';
import { VocabularyController } from './vocabulary.controller';
import { CategoryModule } from '../category/category.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vocabulary,
      VocabularyExample,
      VocabularyProgress,
      VocabularyBookmark,
      VocabularyQuizAttempt,
    ]),
    CategoryModule,
    UserModule,
  ],
  providers: [
    VocabularyService,
    VocabularyProgressService,
    VocabularyBookmarkService,
    VocabularyQuizAttemptService,
  ],
  controllers: [VocabularyController],
})
export class VocabularyModule {}
