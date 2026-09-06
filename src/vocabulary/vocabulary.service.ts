import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ServiceUnavailableException,
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
  ContributeVocabularyDto,
} from './vocabulary.dto';
import { Category } from '../category/category.entity';
import { UserService } from '../user/user.service';

const VALID_POS = Object.values(EPartOfSpeech) as string[];

interface WordEnrichmentResult {
  valid: boolean;
  reason?: string;
  meaning_th?: string;
  ipa?: string;
  part_of_speech?: string;
  example?: string;
}

interface DictionaryApiEntry {
  phonetic?: string;
  phonetics?: { text?: string }[];
  meanings?: {
    partOfSpeech?: string;
    definitions?: { definition?: string; example?: string }[];
  }[];
}

@Injectable()
export class VocabularyService {
  constructor(
    @InjectRepository(Vocabulary)
    private readonly repo: Repository<Vocabulary>,
    @InjectRepository(VocabularyExample)
    private readonly exampleRepo: Repository<VocabularyExample>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    private readonly userService: UserService,
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
      idQb.andWhere('v.part_of_speech = :pos', { pos: query.partOfSpeech });
    }

    if (query.categoryId) {
      idQb.andWhere('v.category_id = :categoryId', {
        categoryId: query.categoryId,
      });
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
      vocabularyId: number;
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

      return {
        vocabularyId: ex.vocabulary.id,
        sentence: blankSentence,
        answer,
        meaning,
        options,
      };
    });
  }

  async findDictation(
    limit: number,
  ): Promise<
    { vocabularyId: number; sentence: string; word: string; meaning: string }[]
  > {
    const safeLimit = Math.min(Math.max(1, limit), 20);

    const examples = await this.exampleRepo
      .createQueryBuilder('ex')
      .innerJoinAndSelect('ex.vocabulary', 'v')
      .orderBy('RANDOM()')
      .limit(safeLimit)
      .getMany();

    return examples.map((ex) => ({
      vocabularyId: ex.vocabulary.id,
      sentence: ex.sentence,
      word: ex.vocabulary.word,
      meaning: ex.vocabulary.meaning,
    }));
  }

  /**
   * User-contributed word flow:
   *   1. Reject if the word already exists in the DB.
   *   2. Validate it's a real English word and enrich it via free
   *      dictionary + translation APIs (no paid AI quota involved) — if the
   *      dictionary API is down, falls back to translation-only with
   *      weaker validation rather than blocking the contribution entirely.
   *   3. Save it, then record progress toward the free-access bonus.
   *
   * category and cefrLevel are left null here — there's no free source for
   * them — and get backfilled later by the existing `auto-categorize` /
   * `auto-level` batch scripts.
   */
  async contributeWord(
    userId: string,
    dto: ContributeVocabularyDto,
  ): Promise<{
    vocabulary: Vocabulary;
    contributedWordsCount: number;
    contributionGoal: number;
    freeAccessUntil: Date | null;
    bonusGranted: boolean;
  }> {
    const word = dto.word.trim();
    if (!/^[a-zA-Z][a-zA-Z\s'-]*$/.test(word)) {
      throw new BadRequestException('กรุณากรอกคำศัพท์ภาษาอังกฤษเท่านั้น');
    }

    const existing = await this.repo.findOne({ where: { word: ILike(word) } });
    if (existing) {
      throw new ConflictException(`คำว่า "${word}" มีอยู่ในระบบแล้ว`);
    }

    const enrichment = await this.enrichWordWithDictionary(word);

    if (!enrichment.valid) {
      throw new BadRequestException(
        enrichment.reason || `"${word}" ไม่ใช่คำศัพท์ภาษาอังกฤษที่ถูกต้อง`,
      );
    }

    const meaning = String(enrichment.meaning_th ?? '').trim();
    if (!meaning) {
      throw new BadRequestException('ไม่สามารถหาความหมายของคำนี้ได้');
    }

    const posRaw = String(enrichment.part_of_speech ?? '')
      .trim()
      .toLowerCase();
    const partOfSpeech = VALID_POS.includes(posRaw)
      ? (posRaw as EPartOfSpeech)
      : EPartOfSpeech.OTHER;

    const vocab = this.repo.create({
      word,
      meaning,
      pronunciationThai: null, // no free source for Thai phonetic reading
      ipa: String(enrichment.ipa ?? '').trim() || null,
      partOfSpeech,
      cefrLevel: null,
    });

    const example = String(enrichment.example ?? '').trim();
    if (example) {
      vocab.examples = [this.exampleRepo.create({ sentence: example })];
    }

    const saved = await this.repo.save(vocab);
    const contribution = await this.userService.recordWordContribution(userId);

    return {
      vocabulary: saved,
      contributedWordsCount: contribution.contributedWordsCount,
      contributionGoal: 10,
      freeAccessUntil: contribution.freeAccessUntil,
      bonusGranted: contribution.bonusGranted,
    };
  }

  /**
   * Free Dictionary API (api.dictionaryapi.dev) — no key, no quota.
   * It's a hobby-run free service with no SLA, so on outage/error we
   * degrade to translateOnlyFallback() instead of blocking the whole
   * contribution — a real 404 (word genuinely not found) is the only
   * case treated as invalid input.
   */
  private async enrichWordWithDictionary(
    word: string,
  ): Promise<WordEnrichmentResult> {
    let response: Response | null = null;
    try {
      response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`,
        { signal: AbortSignal.timeout(5000) },
      );
    } catch (err) {
      // Includes timeouts — a hanging/slow outage must fail fast so the
      // fallback below still has time to run within the client's timeout.
      console.error('Dictionary API request failed:', err);
    }

    if (response?.status === 404) {
      return {
        valid: false,
        reason: `"${word}" ไม่ใช่คำศัพท์ภาษาอังกฤษที่ถูกต้อง`,
      };
    }

    if (!response || !response.ok) {
      if (response) console.error(`Dictionary API error ${response.status}`);
      return this.translateOnlyFallback(word);
    }

    const entries = (await response.json()) as DictionaryApiEntry[];
    const meaning = entries[0]?.meanings?.[0];
    const definition = meaning?.definitions?.[0];
    const englishMeaning = definition?.definition?.trim();

    if (!englishMeaning) {
      return { valid: false, reason: `ไม่พบความหมายของ "${word}"` };
    }

    const ipa = (
      entries[0]?.phonetic || entries[0]?.phonetics?.find((p) => p.text)?.text
    )
      ?.trim()
      .replace(/^\/|\/$/g, '');

    const meaningTh = await this.translateToThai(englishMeaning);

    return {
      valid: true,
      meaning_th: meaningTh || englishMeaning,
      ipa: ipa || undefined,
      part_of_speech: meaning?.partOfSpeech,
      example: definition?.example,
    };
  }

  /**
   * Used when the dictionary lookup itself is unreachable — translates the
   * word directly instead of its definition, and skips IPA/POS/example
   * since there's no free source for those without the dictionary API.
   * There's no way to confirm the word is genuinely English here (just the
   * earlier format check), so contributions during a dictionary outage get
   * weaker validation until it recovers.
   */
  private async translateOnlyFallback(
    word: string,
  ): Promise<WordEnrichmentResult> {
    const meaningTh = await this.translateToThai(word);
    if (!meaningTh) {
      throw new ServiceUnavailableException(
        'ระบบตรวจสอบคำศัพท์ไม่พร้อมใช้งานในขณะนี้ กรุณาลองใหม่อีกครั้งภายหลัง',
      );
    }
    return { valid: true, meaning_th: meaningTh };
  }

  /** MyMemory free translation API — no key, ~5000 words/day anonymous quota. */
  private async translateToThai(text: string): Promise<string | null> {
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|th`,
        { signal: AbortSignal.timeout(5000) },
      );
      if (!res.ok) return null;
      const json = (await res.json()) as {
        responseData?: { translatedText?: string };
      };
      return json.responseData?.translatedText?.trim() || null;
    } catch (err) {
      console.error('Translation API request failed:', err);
      return null;
    }
  }
}
