import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { VocabularyProgress } from './vocabulary-progress.entity';
import { Vocabulary } from './vocabulary.entity';
import { UserActivityService } from '../user/user-activity.service';

const MIN_EASE_FACTOR = 1.3;

@Injectable()
export class VocabularyProgressService {
  constructor(
    @InjectRepository(VocabularyProgress)
    private readonly progressRepo: Repository<VocabularyProgress>,
    @InjectRepository(Vocabulary)
    private readonly vocabRepo: Repository<Vocabulary>,
    private readonly userActivityService: UserActivityService,
  ) {}

  async recordReview(
    userId: string,
    vocabularyId: number,
    correct: boolean,
  ): Promise<VocabularyProgress> {
    const vocab = await this.vocabRepo.findOne({
      where: { id: vocabularyId },
    });
    if (!vocab) {
      throw new NotFoundException(`Vocabulary #${vocabularyId} not found`);
    }

    let progress = await this.progressRepo.findOne({
      where: { user: { id: userId }, vocabulary: { id: vocabularyId } },
    });

    if (!progress) {
      progress = this.progressRepo.create({
        user: { id: userId } as VocabularyProgress['user'],
        vocabulary: vocab,
        timesSeen: 0,
        timesCorrect: 0,
        timesWrong: 0,
        easeFactor: 2.5,
        intervalDays: 0,
        repetitions: 0,
      });
    }

    if (correct) {
      progress.repetitions += 1;
      if (progress.repetitions === 1) {
        progress.intervalDays = 1;
      } else if (progress.repetitions === 2) {
        progress.intervalDays = 6;
      } else {
        progress.intervalDays = Math.round(
          progress.intervalDays * progress.easeFactor,
        );
      }
      progress.easeFactor = Math.max(
        MIN_EASE_FACTOR,
        progress.easeFactor + 0.1,
      );
      progress.timesCorrect += 1;
    } else {
      progress.repetitions = 0;
      progress.intervalDays = 1;
      progress.easeFactor = Math.max(
        MIN_EASE_FACTOR,
        progress.easeFactor - 0.2,
      );
      progress.timesWrong += 1;
    }

    progress.timesSeen += 1;
    progress.lastReviewedDate = new Date();
    progress.nextReviewDate = new Date(
      Date.now() + progress.intervalDays * 24 * 60 * 60 * 1000,
    );

    const saved = await this.progressRepo.save(progress);
    await this.userActivityService.recordActivity(userId);
    return saved;
  }

  async getDueForReview(userId: string, limit: number): Promise<Vocabulary[]> {
    const dueRows = await this.progressRepo
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.vocabulary', 'v')
      .where('p.user_id = :userId', { userId })
      .andWhere('p.next_review_date <= NOW()')
      .orderBy('p.next_review_date', 'ASC')
      .limit(limit)
      .getMany();

    const dueVocab = dueRows.map((p) => p.vocabulary);
    const remaining = limit - dueVocab.length;
    if (remaining <= 0) return dueVocab;

    // Words the user already has a progress row for (due or not) — exclude from the fresh pool
    const seenRows = await this.progressRepo
      .createQueryBuilder('p')
      .select('p.vocabulary_id', 'vocabId')
      .where('p.user_id = :userId', { userId })
      .getRawMany<{ vocabId: number }>();
    const excludeIds = seenRows.map((r) => r.vocabId);

    const idQb = this.vocabRepo
      .createQueryBuilder('v')
      .select('v.id')
      .orderBy('RANDOM()')
      .limit(remaining);
    if (excludeIds.length > 0) {
      idQb.where('v.id NOT IN (:...excludeIds)', { excludeIds });
    }

    const rows = await idQb.getRawMany<{ v_id: number }>();
    const ids = rows.map((r) => r.v_id);
    if (ids.length === 0) return dueVocab;

    const freshVocab = await this.vocabRepo
      .createQueryBuilder('v')
      .where('v.id IN (:...ids)', { ids })
      .getMany();

    return [...dueVocab, ...freshVocab];
  }

  async getProgressStats(userId: string): Promise<{
    totalReviewed: number;
    totalMastered: number;
    accuracy: number;
    dueToday: number;
  }> {
    const rows = await this.progressRepo.find({
      where: { user: { id: userId } },
    });

    const totalReviewed = rows.length;
    const totalMastered = rows.filter(
      (r) => r.repetitions >= 5 || r.easeFactor >= 3.0,
    ).length;
    const totalSeen = rows.reduce((sum, r) => sum + r.timesSeen, 0);
    const totalCorrect = rows.reduce((sum, r) => sum + r.timesCorrect, 0);
    const accuracy = totalSeen > 0 ? totalCorrect / totalSeen : 0;

    const dueToday = await this.progressRepo.count({
      where: {
        user: { id: userId },
        nextReviewDate: LessThanOrEqual(new Date()),
      },
    });

    return { totalReviewed, totalMastered, accuracy, dueToday };
  }
}
