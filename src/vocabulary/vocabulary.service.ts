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
  ECefrLevel,
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
const VALID_LEVELS = Object.values(ECefrLevel) as string[];

interface WordEnrichmentResult {
  valid: boolean;
  reason?: string;
  meaning_th?: string;
  pronunciation_thai?: string;
  ipa?: string;
  part_of_speech?: string;
  cefr_level?: string;
  category?: string;
  example?: string;
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
   *   2. Ask AI to validate it's a real English word and enrich all fields.
   *   3. Save it, then record progress toward the free-access bonus.
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

    const categories = await this.categoryRepo.find();
    const enrichment = await this.enrichWordWithAi(word, categories);

    if (!enrichment.valid) {
      throw new BadRequestException(
        enrichment.reason || `"${word}" ไม่ใช่คำศัพท์ภาษาอังกฤษที่ถูกต้อง`,
      );
    }

    const meaning = String(enrichment.meaning_th ?? '').trim();
    if (!meaning) {
      throw new BadRequestException('AI ไม่สามารถให้ความหมายของคำนี้ได้');
    }

    const posRaw = String(enrichment.part_of_speech ?? '')
      .trim()
      .toLowerCase();
    const partOfSpeech = VALID_POS.includes(posRaw)
      ? (posRaw as EPartOfSpeech)
      : EPartOfSpeech.OTHER;

    const levelRaw = String(enrichment.cefr_level ?? '')
      .trim()
      .toUpperCase();
    const cefrLevel = VALID_LEVELS.includes(levelRaw)
      ? (levelRaw as ECefrLevel)
      : null;

    const categoryName = String(enrichment.category ?? '')
      .trim()
      .toLowerCase();
    const category =
      categoryName && categoryName !== 'none'
        ? (categories.find((c) => c.name.toLowerCase() === categoryName) ??
          null)
        : null;

    const vocab = this.repo.create({
      word,
      meaning,
      pronunciationThai:
        String(enrichment.pronunciation_thai ?? '').trim() || null,
      ipa: String(enrichment.ipa ?? '').trim() || null,
      partOfSpeech,
      cefrLevel,
      ...(category ? { category } : {}),
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

  private async enrichWordWithAi(
    word: string,
    categories: Category[],
  ): Promise<WordEnrichmentResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      throw new ServiceUnavailableException(
        'ระบบ AI ไม่พร้อมใช้งานในขณะนี้ กรุณาลองใหม่อีกครั้งภายหลัง',
      );
    }

    const categoryList = categories
      .map((c) => `- ${c.name}${c.nameTh ? ` (${c.nameTh})` : ''}`)
      .join('\n');

    const prompt = `You are an English dictionary and vocabulary expert.
A user submitted the word/phrase: "${word}"

Step 1: Decide if this is a genuine, real English word or common phrase (dictionary-valid). Reject gibberish, misspellings, non-English text, or offensive content.
Step 2: If valid, provide its dictionary data.
Step 3: Assign it to the SINGLE most fitting category from the list below — only if its primary meaning specifically belongs there, otherwise "none".

Available categories (use the exact English name):
${categoryList || '(none defined)'}

Return ONLY a valid JSON object — no markdown, no explanation, no code fences.

If NOT a valid English word:
{"valid": false, "reason": "<short reason in Thai>"}

If valid:
{
  "valid": true,
  "meaning_th": "<Thai meaning>",
  "pronunciation_thai": "<Thai phonetic reading>",
  "ipa": "<IPA transcription with slashes>",
  "part_of_speech": "<one of: noun, verb, adjective, adverb, preposition, conjunction, pronoun, phrase, other>",
  "cefr_level": "<one of: A1, A2, B1, B2, C1, C2>",
  "category": "<exact category name or none>",
  "example": "<one natural example sentence using the word>"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      // Log the raw provider error server-side only — it can contain
      // account/billing details that shouldn't reach the end user.
      console.error(`Gemini API error ${response.status}: ${errText}`);
      throw new ServiceUnavailableException(
        'ระบบ AI ไม่พร้อมใช้งานในขณะนี้ กรุณาลองใหม่อีกครั้งภายหลัง',
      );
    }

    const json = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(
        `Gemini returned no JSON object. Raw: ${rawText.slice(0, 300)}`,
      );
      throw new ServiceUnavailableException(
        'ระบบ AI ไม่พร้อมใช้งานในขณะนี้ กรุณาลองใหม่อีกครั้งภายหลัง',
      );
    }

    try {
      return JSON.parse(jsonMatch[0]) as WordEnrichmentResult;
    } catch {
      console.error(
        `Gemini returned invalid JSON: ${jsonMatch[0].slice(0, 300)}`,
      );
      throw new ServiceUnavailableException(
        'ระบบ AI ไม่พร้อมใช้งานในขณะนี้ กรุณาลองใหม่อีกครั้งภายหลัง',
      );
    }
  }
}
