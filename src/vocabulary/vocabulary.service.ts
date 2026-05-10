import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Readable } from 'stream';
import { parse } from 'csv-parse';
import {
  Vocabulary,
  VocabularyExample,
  EPartOfSpeech,
} from './vocabulary.entity';
import {
  CreateVocabularyDto,
  UpdateVocabularyDto,
  QueryVocabularyDto,
  RandomVocabularyDto,
} from './vocabulary.dto';
import { Category } from '../category/category.entity';

const VALID_POS = Object.values(EPartOfSpeech) as string[];

@Injectable()
export class VocabularyService {
  constructor(
    @InjectRepository(Vocabulary)
    private readonly repo: Repository<Vocabulary>,
    @InjectRepository(VocabularyExample)
    private readonly exampleRepo: Repository<VocabularyExample>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findAll(query: QueryVocabularyDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const categoryFilter = query.categoryId
      ? { category: { id: query.categoryId } }
      : {};
    const posFilter = query.partOfSpeech
      ? { partOfSpeech: query.partOfSpeech }
      : {};
    const levelFilter = query.cefrLevel ? { cefrLevel: query.cefrLevel } : {};

    const where: object[] | object = query.search
      ? [
          {
            word: ILike(`%${query.search}%`),
            ...posFilter,
            ...categoryFilter,
            ...levelFilter,
          },
          {
            meaning: ILike(`%${query.search}%`),
            ...posFilter,
            ...categoryFilter,
            ...levelFilter,
          },
        ]
      : { ...posFilter, ...categoryFilter, ...levelFilter };

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { createdDate: 'DESC' },
      relations: { examples: true, category: true },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findRandom(query: RandomVocabularyDto): Promise<Vocabulary[]> {
    const limit = query.limit ?? 20;

    // Step 1: Get random IDs without JOIN to avoid PostgreSQL's
    // "SELECT DISTINCT + ORDER BY RANDOM()" restriction
    const idQb = this.repo
      .createQueryBuilder('v')
      .select('v.id')
      .orderBy('RANDOM()')
      .limit(limit);

    if (query.partOfSpeech) {
      // Parameterized query — safe from SQL injection
      idQb.where('v.part_of_speech = :pos', { pos: query.partOfSpeech });
    }

    const rawExclude = query.excludeIds;
    const excludeIds: number[] = Array.isArray(rawExclude) ? rawExclude : [];
    if (excludeIds.length > 0) {
      // Exclude previously seen words to prevent duplicates across calls
      idQb.andWhere('v.id NOT IN (:...excludeIds)', { excludeIds });
    }

    const rows = await idQb.getRawMany<{ v_id: number }>();
    const ids = rows.map((r) => r.v_id);

    if (ids.length === 0) return [];

    // Step 2: Fetch full entities with relations using the resolved IDs
    return this.repo
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.examples', 'examples')
      .where('v.id IN (:...ids)', { ids })
      .getMany();
  }

  async findOne(id: number): Promise<Vocabulary> {
    const vocab = await this.repo.findOne({
      where: { id },
      relations: { examples: true, category: true },
    });
    if (!vocab) throw new NotFoundException(`Vocabulary #${id} not found`);
    return vocab;
  }

  async create(dto: CreateVocabularyDto): Promise<Vocabulary> {
    const examples = dto.examples;
    const vocab = this.repo.create({
      word: dto.word,
      meaning: dto.meaning,
      pronunciationThai: dto.pronunciationThai,
      ipa: dto.ipa,
      partOfSpeech: dto.partOfSpeech,
      cefrLevel: dto.cefrLevel ?? null,
    });
    if (dto.categoryId != null) {
      const category = await this.categoryRepo.findOne({
        where: { id: dto.categoryId },
      });
      if (!category)
        throw new NotFoundException(`Category #${dto.categoryId} not found`);
      vocab.category = category;
    }
    if (Array.isArray(examples) && examples.length > 0) {
      vocab.examples = examples.map((sentence: string) =>
        this.exampleRepo.create({ sentence }),
      );
    }
    return this.repo.save(vocab);
  }

  async update(id: number, dto: UpdateVocabularyDto): Promise<Vocabulary> {
    // Load without relation to avoid cascade conflict on scalar-field update
    const vocab = await this.repo.findOne({ where: { id } });
    if (!vocab) throw new NotFoundException(`Vocabulary #${id} not found`);
    const examples = dto.examples;
    Object.assign(vocab, {
      ...(dto.word !== undefined && { word: dto.word }),
      ...(dto.meaning !== undefined && { meaning: dto.meaning }),
      ...(dto.pronunciationThai !== undefined && {
        pronunciationThai: dto.pronunciationThai,
      }),
      ...(dto.ipa !== undefined && { ipa: dto.ipa }),
      ...(dto.partOfSpeech !== undefined && { partOfSpeech: dto.partOfSpeech }),
      ...(dto.cefrLevel !== undefined && { cefrLevel: dto.cefrLevel }),
    });
    if (dto.categoryId !== undefined) {
      if (dto.categoryId === null) {
        vocab.category = null;
      } else {
        const category = await this.categoryRepo.findOne({
          where: { id: dto.categoryId },
        });
        if (!category)
          throw new NotFoundException(`Category #${dto.categoryId} not found`);
        vocab.category = category;
      }
    }
    await this.repo.save(vocab);
    if (examples !== undefined) {
      // Replace all examples for this vocabulary
      await this.exampleRepo.delete({ vocabulary: { id } });
      if (examples.length > 0) {
        const newExamples = examples.map((sentence: string) =>
          this.exampleRepo.create({ sentence, vocabulary: vocab }),
        );
        await this.exampleRepo.save(newExamples);
      }
    }
    return this.findOne(vocab.id);
  }

  async remove(id: number): Promise<void> {
    const vocab = await this.findOne(id);
    await this.repo.remove(vocab);
  }

  async importCsv(
    buffer: Buffer,
  ): Promise<{ imported: number; errors: string[] }> {
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
          const word = String(row['word'] ?? '')
            .trim()
            .slice(0, 255);
          const meaning = String(row['meaning'] ?? '').trim();
          // Collect examples from separate difficulty columns
          const example = ['example_easy', 'example_medium', 'example_hard']
            .map((col) => String(row[col] ?? '').trim())
            .filter((s) => s.length > 0);
          const pronunciationThai = String(row['pronunciation_thai'] ?? '')
            .trim()
            .slice(0, 255);
          const ipa = String(row['ipa'] ?? '')
            .trim()
            .slice(0, 255);
          const posRaw = String(row['part_of_speech'] ?? '')
            .trim()
            .toLowerCase();

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
            examples: example.length > 0 ? example : undefined,
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

    // Find existing words in DB to skip duplicates
    const words = records.map((r) => r.word.toLowerCase());
    const existing = await this.repo
      .createQueryBuilder('v')
      .select('LOWER(v.word)', 'word')
      .where('LOWER(v.word) IN (:...words)', { words })
      .getRawMany<{ word: string }>();
    const existingWords = new Set(existing.map((e) => e.word));

    // Bulk insert only new words — skip duplicates (DB + within batch)
    const seenInBatch = new Set<string>();
    const entities = records
      .filter((r) => {
        const key = r.word.toLowerCase();
        if (existingWords.has(key)) {
          errors.push(`Word "${r.word}" already exists — skipped`);
          return false;
        }
        if (seenInBatch.has(key)) {
          errors.push(`Word "${r.word}" is duplicated in the file — skipped`);
          return false;
        }
        seenInBatch.add(key);
        return true;
      })
      .map((r) => {
        const examples = r.examples;
        const vocab = this.repo.create({
          word: r.word,
          meaning: r.meaning,
          pronunciationThai: r.pronunciationThai,
          ipa: r.ipa,
          partOfSpeech: r.partOfSpeech,
        });
        if (Array.isArray(examples) && examples.length > 0) {
          vocab.examples = examples.map((sentence: string) =>
            this.exampleRepo.create({ sentence }),
          );
        }
        return vocab;
      });

    if (entities.length > 0) await this.repo.save(entities);

    return { imported: entities.length, errors };
  }

  async findFillBlank(limit: number): Promise<
    {
      sentence: string;
      answer: string;
      meaning: string;
      options: string[];
    }[]
  > {
    const safeLimit = Math.min(Math.max(1, limit), 20);

    // Pick random examples that belong to a vocabulary with at least one example
    const examples = await this.exampleRepo
      .createQueryBuilder('ex')
      .innerJoinAndSelect('ex.vocabulary', 'v')
      .orderBy('RANDOM()')
      .limit(safeLimit)
      .getMany();

    if (examples.length === 0) return [];

    // Collect all distinct words to use as distractor pool
    const usedVocabIds = examples.map((ex) => ex.vocabulary.id);
    const distractorPool = await this.repo
      .createQueryBuilder('v')
      .select(['v.id', 'v.word'])
      .where('v.id NOT IN (:...usedVocabIds)', { usedVocabIds })
      .orderBy('RANDOM()')
      .limit(safeLimit * 4)
      .getMany();

    return examples.map((ex) => {
      const answer = ex.vocabulary.word;
      const meaning = ex.vocabulary.meaning;

      // Replace the word (and inflected forms: plural, past tense, etc.) with ___
      const blankSentence = ex.sentence.replace(
        new RegExp(
          `\\b${answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\w*`,
          'i',
        ),
        '___',
      );

      // Pick 3 random distractors from pool
      const distractors = distractorPool
        .filter((v) => v.id !== ex.vocabulary.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((v) => v.word);

      // Shuffle options
      const options = [...distractors, answer].sort(() => Math.random() - 0.5);

      return { sentence: blankSentence, answer, meaning, options };
    });
  }
}
