import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListeningLesson, ListeningUnit } from './listening.entity';

export interface ListeningLessonSummary {
  key: string;
  title: string;
  emoji: string | null;
  displayOrder: number;
  totalUnits: number;
}

export interface ListeningUnitSummary {
  key: string;
  title: string;
  emoji: string | null;
  displayOrder: number;
  videoId: string;
  startSeconds: number;
  endSeconds: number;
  totalLines: number;
}

export interface ListeningLineResponse {
  orderIndex: number;
  speaker: string;
  textEn: string;
  textTh: string | null;
}

export interface ListeningClozeLineResponse {
  orderIndex: number;
  speaker: string;
  textEn: string;
  textTh: string | null;
  blankText: string | null;
  answer: string | null;
}

export interface ListeningUnitDetailResponse extends ListeningUnitSummary {
  lines: ListeningLineResponse[];
}

export interface ListeningUnitClozeResponse extends ListeningUnitSummary {
  lines: ListeningClozeLineResponse[];
}

// Short function/grammar words are skipped when picking a word to blank out,
// so the cloze always targets a meaningful content word.
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'but', 'or', 'if', 'of', 'to', 'in', 'on', 'at',
  'is', 'are', 'was', 'were', 'be', 'been', 'am', 'i', 'you', 'he', 'she',
  'it', 'we', 'they', 'do', 'does', 'did', 'have', 'has', 'had', 'will',
  'would', 'can', 'could', 'should', 'my', 'your', 'his', 'her', 'its',
  'our', 'their', 'this', 'that', 'these', 'those', 'not', 'no', 'yes',
  'so', 'for', 'with', 'from', 'as', 'by', 'up', 'out', 'about', 'into',
  'over', 'after', 'before', 'than', 'then', 'too', 'very', 'just', 'also',
  'well', 'oh', 'um', 'uh', 'huh', 'okay', 'ok', 'me', 'us', 'him', 'them',
  'what', 'when', 'where', 'who', 'why', 'how', 'there', 'here', 'some',
  'any', 'all', 'more', 'much', 'many', 'let', 'get', 'got', 'one', 'two',
]);

function pickClozeWord(text: string): { blankText: string; answer: string } | null {
  const matches = [...text.matchAll(/[A-Za-z']+/g)];
  const candidates = matches.filter(
    (m) => m[0].length >= 4 && !STOPWORDS.has(m[0].toLowerCase()),
  );
  if (candidates.length === 0) return null;

  // Pick the longest candidate word; deterministic given the same text.
  const chosen = candidates.reduce((best, cur) =>
    cur[0].length > best[0].length ? cur : best,
  );
  const answer = chosen[0];
  const start = chosen.index ?? 0;
  const blankText =
    text.slice(0, start) + '_'.repeat(answer.length) + text.slice(start + answer.length);

  return { blankText, answer };
}

@Injectable()
export class ListeningService {
  constructor(
    @InjectRepository(ListeningLesson)
    private readonly lessonRepo: Repository<ListeningLesson>,
    @InjectRepository(ListeningUnit)
    private readonly unitRepo: Repository<ListeningUnit>,
  ) {}

  async getLessons(): Promise<ListeningLessonSummary[]> {
    const lessons = await this.lessonRepo.find({
      order: { displayOrder: 'ASC', id: 'ASC' },
      relations: { units: true },
    });

    return lessons.map((l) => ({
      key: l.key,
      title: l.title,
      emoji: l.emoji,
      displayOrder: l.displayOrder,
      totalUnits: l.units?.length ?? 0,
    }));
  }

  async getUnitsByLesson(lessonKey: string): Promise<ListeningUnitSummary[]> {
    const lesson = await this.lessonRepo.findOne({ where: { key: lessonKey } });
    if (!lesson) return [];

    const units = await this.unitRepo.find({
      where: { lesson: { id: lesson.id } },
      order: { displayOrder: 'ASC', id: 'ASC' },
      relations: { lines: true },
    });

    return units.map((u) => this.toSummary(u));
  }

  async getUnitDetail(
    key: string,
  ): Promise<ListeningUnitDetailResponse | null> {
    const unit = await this.findUnitWithLines(key);
    if (!unit) return null;

    return {
      ...this.toSummary(unit),
      lines: unit.lines.map((l) => ({
        orderIndex: l.orderIndex,
        speaker: l.speaker,
        textEn: l.textEn,
        textTh: l.textTh,
      })),
    };
  }

  async getUnitCloze(
    key: string,
  ): Promise<ListeningUnitClozeResponse | null> {
    const unit = await this.findUnitWithLines(key);
    if (!unit) return null;

    return {
      ...this.toSummary(unit),
      lines: unit.lines.map((l) => {
        const cloze = pickClozeWord(l.textEn);
        return {
          orderIndex: l.orderIndex,
          speaker: l.speaker,
          textEn: l.textEn,
          textTh: l.textTh,
          blankText: cloze?.blankText ?? null,
          answer: cloze?.answer ?? null,
        };
      }),
    };
  }

  private async findUnitWithLines(key: string): Promise<ListeningUnit | null> {
    const unit = await this.unitRepo.findOne({
      where: { key },
      relations: { lines: true },
    });
    if (!unit) return null;

    unit.lines = (unit.lines ?? []).sort((a, b) => a.orderIndex - b.orderIndex);
    return unit;
  }

  private toSummary(unit: ListeningUnit): ListeningUnitSummary {
    return {
      key: unit.key,
      title: unit.title,
      emoji: unit.emoji,
      displayOrder: unit.displayOrder,
      videoId: unit.videoId,
      startSeconds: unit.startSeconds,
      endSeconds: unit.endSeconds,
      totalLines: unit.lines?.length ?? 0,
    };
  }
}
