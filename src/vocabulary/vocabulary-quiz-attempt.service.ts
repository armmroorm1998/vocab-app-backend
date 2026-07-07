import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VocabularyQuizAttempt } from './vocabulary-quiz-attempt.entity';
import { Vocabulary } from './vocabulary.entity';
import { UserActivityService } from '../user/user-activity.service';

export interface QuizAttemptStats {
  totalAttempts: number;
  correctCount: number;
  accuracy: number;
}

export interface WeakWord {
  vocabularyId: number;
  word: string;
  meaning: string;
  total: number;
  wrongCount: number;
}

@Injectable()
export class VocabularyQuizAttemptService {
  constructor(
    @InjectRepository(VocabularyQuizAttempt)
    private readonly attemptRepo: Repository<VocabularyQuizAttempt>,
    @InjectRepository(Vocabulary)
    private readonly vocabRepo: Repository<Vocabulary>,
    private readonly userActivityService: UserActivityService,
  ) {}

  async submitAnswer(
    userId: string,
    vocabularyId: number,
    selectedAnswer: string,
  ): Promise<{ isCorrect: boolean; correctAnswer: string }> {
    const vocab = await this.vocabRepo.findOne({ where: { id: vocabularyId } });
    if (!vocab) {
      throw new NotFoundException(`Vocabulary #${vocabularyId} not found`);
    }

    const correctAnswer = vocab.meaning;
    const isCorrect = selectedAnswer === correctAnswer;

    const attempt = this.attemptRepo.create({
      user: { id: userId } as VocabularyQuizAttempt['user'],
      vocabulary: vocab,
      selectedAnswer,
      correctAnswer,
      isCorrect,
    });
    await this.attemptRepo.save(attempt);
    await this.userActivityService.recordActivity(userId);

    return { isCorrect, correctAnswer };
  }

  async getStats(userId: string): Promise<QuizAttemptStats> {
    const [attempts, total] = await this.attemptRepo.findAndCount({
      where: { user: { id: userId } },
    });
    const correctCount = attempts.filter((a) => a.isCorrect).length;
    return {
      totalAttempts: total,
      correctCount,
      accuracy: total > 0 ? correctCount / total : 0,
    };
  }

  async getWeakWords(userId: string, limit: number): Promise<WeakWord[]> {
    const rows = await this.attemptRepo
      .createQueryBuilder('a')
      .innerJoin('a.vocabulary', 'v')
      .select('v.id', 'vocabId')
      .addSelect('v.word', 'word')
      .addSelect('v.meaning', 'meaning')
      .addSelect('COUNT(*)', 'total')
      .addSelect(
        `SUM(CASE WHEN a.is_correct = false THEN 1 ELSE 0 END)`,
        'wrongCount',
      )
      .where('a.user_id = :userId', { userId })
      .groupBy('v.id')
      .addGroupBy('v.word')
      .addGroupBy('v.meaning')
      .having(`SUM(CASE WHEN a.is_correct = false THEN 1 ELSE 0 END) > 0`)
      .orderBy(`SUM(CASE WHEN a.is_correct = false THEN 1 ELSE 0 END)`, 'DESC')
      .limit(limit)
      .getRawMany<{
        vocabId: number;
        word: string;
        meaning: string;
        total: string;
        wrongCount: string;
      }>();

    return rows.map((r) => ({
      vocabularyId: Number(r.vocabId),
      word: r.word,
      meaning: r.meaning,
      total: Number(r.total),
      wrongCount: Number(r.wrongCount),
    }));
  }
}
