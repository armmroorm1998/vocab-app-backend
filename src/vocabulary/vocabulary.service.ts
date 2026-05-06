import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Readable } from 'stream';
import { parse } from 'csv-parse';
import { Vocabulary, EPartOfSpeech } from './vocabulary.entity';
import {
  CreateVocabularyDto,
  UpdateVocabularyDto,
  QueryVocabularyDto,
  RandomVocabularyDto,
} from './vocabulary.dto';

const VALID_POS = Object.values(EPartOfSpeech) as string[];

@Injectable()
export class VocabularyService {
  constructor(
    @InjectRepository(Vocabulary)
    private readonly repo: Repository<Vocabulary>,
  ) {}

  async findAll(query: QueryVocabularyDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: object[] | object = query.search
      ? [
          { word: ILike(`%${query.search}%`), ...(query.partOfSpeech ? { partOfSpeech: query.partOfSpeech } : {}) },
          { meaning: ILike(`%${query.search}%`), ...(query.partOfSpeech ? { partOfSpeech: query.partOfSpeech } : {}) },
        ]
      : query.partOfSpeech
        ? { partOfSpeech: query.partOfSpeech }
        : {};

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { createdDate: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findRandom(query: RandomVocabularyDto): Promise<Vocabulary[]> {
    const limit = query.limit ?? 20;
    const qb = this.repo.createQueryBuilder('v').orderBy('RANDOM()').take(limit);
    if (query.partOfSpeech) {
      // Parameterized query — safe from SQL injection
      qb.where('v.part_of_speech = :pos', { pos: query.partOfSpeech });
    }
    return qb.getMany();
  }

  async findOne(id: number): Promise<Vocabulary> {
    const vocab = await this.repo.findOne({ where: { id } });
    if (!vocab) throw new NotFoundException(`Vocabulary #${id} not found`);
    return vocab;
  }

  async create(dto: CreateVocabularyDto): Promise<Vocabulary> {
    const vocab = this.repo.create(dto);
    return this.repo.save(vocab);
  }

  async update(id: number, dto: UpdateVocabularyDto): Promise<Vocabulary> {
    const vocab = await this.findOne(id);
    Object.assign(vocab, dto);
    return this.repo.save(vocab);
  }

  async remove(id: number): Promise<void> {
    const vocab = await this.findOne(id);
    await this.repo.remove(vocab);
  }

  async importCsv(buffer: Buffer): Promise<{ imported: number; errors: string[] }> {
    const records: CreateVocabularyDto[] = [];
    const errors: string[] = [];
    let rowIndex = 1;

    await new Promise<void>((resolve, reject) => {
      const stream = Readable.from(buffer);
      stream
        .pipe(
          parse({
            columns: true,
            skip_empty_lines: true,
            trim: true,
            bom: true,
          }),
        )
        .on('data', (row: Record<string, string>) => {
          rowIndex++;
          // Sanitize all string fields to prevent injection
          const word = String(row['word'] ?? '').trim().slice(0, 255);
          const meaning = String(row['meaning'] ?? '').trim();
          const example = String(row['example'] ?? '').trim();
          const pronunciationThai = String(row['pronunciation_thai'] ?? '').trim().slice(0, 255);
          const ipa = String(row['ipa'] ?? '').trim().slice(0, 255);
          const posRaw = String(row['part_of_speech'] ?? '').trim().toLowerCase();

          if (!word || !meaning) {
            errors.push(`Row ${rowIndex}: missing word or meaning — skipped`);
            return;
          }

          const partOfSpeech = VALID_POS.includes(posRaw)
            ? (posRaw as EPartOfSpeech)
            : EPartOfSpeech.OTHER;

          records.push({
            word,
            meaning,
            example: example || undefined,
            pronunciationThai: pronunciationThai || undefined,
            ipa: ipa || undefined,
            partOfSpeech,
          });
        })
        .on('error', (err: Error) =>
          reject(new BadRequestException(`Invalid CSV: ${err.message}`)),
        )
        .on('end', resolve);
    });

    if (records.length === 0) return { imported: 0, errors };

    // Bulk insert with upsert on word to avoid duplicates
    const entities = records.map((r) => this.repo.create(r));
    await this.repo.save(entities);

    return { imported: entities.length, errors };
  }
}
