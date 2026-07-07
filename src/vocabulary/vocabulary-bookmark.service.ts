import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VocabularyBookmark } from './vocabulary-bookmark.entity';
import { Vocabulary } from './vocabulary.entity';

@Injectable()
export class VocabularyBookmarkService {
  constructor(
    @InjectRepository(VocabularyBookmark)
    private readonly bookmarkRepo: Repository<VocabularyBookmark>,
    @InjectRepository(Vocabulary)
    private readonly vocabRepo: Repository<Vocabulary>,
  ) {}

  async addBookmark(userId: string, vocabularyId: number): Promise<void> {
    const existing = await this.bookmarkRepo.findOne({
      where: { user: { id: userId }, vocabulary: { id: vocabularyId } },
    });
    if (existing) return;

    const vocab = await this.vocabRepo.findOne({
      where: { id: vocabularyId },
    });
    if (!vocab) {
      throw new NotFoundException(`Vocabulary #${vocabularyId} not found`);
    }

    const bookmark = this.bookmarkRepo.create({
      user: { id: userId } as VocabularyBookmark['user'],
      vocabulary: vocab,
    });
    await this.bookmarkRepo.save(bookmark);
  }

  async removeBookmark(userId: string, vocabularyId: number): Promise<void> {
    await this.bookmarkRepo.delete({
      user: { id: userId },
      vocabulary: { id: vocabularyId },
    });
  }

  async listBookmarks(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Vocabulary[]; total: number }> {
    const skip = (page - 1) * limit;
    const [rows, total] = await this.bookmarkRepo.findAndCount({
      where: { user: { id: userId } },
      relations: { vocabulary: { examples: true, category: true } },
      order: { createdDate: 'DESC' },
      skip,
      take: limit,
    });
    return { data: rows.map((r) => r.vocabulary), total };
  }
}
