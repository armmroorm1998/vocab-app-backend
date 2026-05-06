import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vocabulary } from './vocabulary.entity';
import { VocabularyService } from './vocabulary.service';
import { VocabularyController } from './vocabulary.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Vocabulary])],
  providers: [VocabularyService],
  controllers: [VocabularyController],
})
export class VocabularyModule {}
