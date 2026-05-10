/**
 * Generate vocab script:
 *   Ask Gemini to generate English vocabulary words for a given CEFR level →
 *   deduplicate against DB → insert new words.
 *
 * Run:
 *   npm run vocab:generate -- --level A1 --count 100
 *   npm run vocab:generate -- --level B2 --count 50
 *
 * Options:
 *   --level   A1 | A2 | B1 | B2 | C1 | C2  (required)
 *   --count   number of words to request     (default: 100)
 *
 * Requirements:
 *   - GEMINI_API_KEY in .env
 *   - DB credentials in .env
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource, Repository } from 'typeorm';
import {
  Vocabulary,
  VocabularyExample,
  ECefrLevel,
  EPartOfSpeech,
} from '../vocabulary/vocabulary.entity';
import { Category } from '../category/category.entity';

dotenv.config();

// ─── Config ──────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌  GEMINI_API_KEY is not set in .env');
  process.exit(1);
}

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
const GEMINI_BATCH_SIZE = 15; // words per Gemini call — keeps response small enough to avoid truncation
const BATCH_DELAY_MS = 2000;

// ─── Parse args ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const getArg = (flag: string): string | undefined => {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : undefined;
};

const VALID_LEVELS = Object.values(ECefrLevel) as string[];
const rawLevel = getArg('--level')?.toUpperCase();
if (!rawLevel || !VALID_LEVELS.includes(rawLevel)) {
  console.error(
    `❌  --level is required. Valid values: ${VALID_LEVELS.join(', ')}`,
  );
  process.exit(1);
}
const TARGET_LEVEL = rawLevel as ECefrLevel;
const REQUEST_COUNT = Math.min(
  Math.max(10, parseInt(getArg('--count') ?? '100', 10)),
  300,
);

// ─── Types ───────────────────────────────────────────────────────────────────

interface GeminiWord {
  word: string;
  meaning_th: string;
  pronunciation_thai: string;
  ipa: string;
  part_of_speech: string;
  example_easy: string;
  example_medium: string;
  example_hard: string;
}

// ─── Gemini helper ───────────────────────────────────────────────────────────

const VALID_POS = Object.values(EPartOfSpeech) as string[];

const LEVEL_GUIDE: Record<ECefrLevel, string> = {
  A1: 'most basic everyday words that absolute beginners know (e.g. cat, eat, big, hello, water, red)',
  A2: 'elementary words used in simple daily conversations (e.g. hospital, always, cheap, travel)',
  B1: 'intermediate words for general communication (e.g. negotiate, recommend, unfortunately)',
  B2: 'upper-intermediate words found in formal or written contexts (e.g. sustainable, implication, controversial)',
  C1: 'advanced words used by proficient speakers (e.g. rhetoric, pragmatic, meticulous)',
  C2: 'near-native proficiency words, rare or academic (e.g. ephemeral, soliloquy, perspicacious)',
};

async function callGemini(
  level: ECefrLevel,
  count: number,
  mustExclude: Set<string>, // always included — words from this run's previous batches
  samplePool: Set<string>, // DB words — randomly sampled to keep prompt short
): Promise<GeminiWord[]> {
  // Always include mustExclude words, then fill remaining slots with random DB sample
  const poolArray = [...samplePool];
  for (let i = poolArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [poolArray[i], poolArray[j]] = [poolArray[j], poolArray[i]];
  }
  const SAMPLE_LIMIT = 200;
  const mustList = [...mustExclude];
  const remaining = Math.max(0, SAMPLE_LIMIT - mustList.length);
  const exclusionSample = [...mustList, ...poolArray.slice(0, remaining)].join(
    ', ',
  );

  const prompt = `You are an English dictionary and vocabulary expert.
Generate exactly ${count} English vocabulary words at CEFR level ${level}.

Level ${level} description: ${LEVEL_GUIDE[level]}

Rules:
1. Each word must genuinely match CEFR level ${level}
2. Include nouns, verbs, adjectives, adverbs — a natural mix
3. Provide all fields: Thai meaning, Thai pronunciation, IPA, part_of_speech, and 3 example sentences
4. part_of_speech must be one of: noun, verb, adjective, adverb, preposition, conjunction, pronoun, phrase, other
5. example_easy: short simple sentence, example_medium: moderate sentence, example_hard: complex or idiomatic sentence
6. Avoid extremely common/basic words (e.g. eat, drink, sleep, walk, run, big, small, good, bad, like, go, come, see, say, know, get, make, take)
7. Do NOT include any of these words (already in database): ${exclusionSample || '(none yet)'}
8. Return ONLY a valid JSON array — no markdown, no explanation, no code fences

Format:
[
  {"word": "apple", "meaning_th": "แอปเปิล", "pronunciation_thai": "แอ็พ-เพิล", "ipa": "/ˈæp.əl/", "part_of_speech": "noun", "example_easy": "I eat an apple.", "example_medium": "She eats an apple after lunch.", "example_hard": "An apple a day keeps the doctor away."},
  {"word": "run", "meaning_th": "วิ่ง", "pronunciation_thai": "รัน", "ipa": "/rʌn/", "part_of_speech": "verb", "example_easy": "I run every day.", "example_medium": "He runs to school when he is late.", "example_hard": "She decided to run for office despite the challenges."}
]

Generate ${count} words now:`;

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 16384 },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const json = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  // Extract JSON array robustly — handles extra text/explanation from Gemini
  const jsonMatch = rawText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error(
      `Gemini response contains no JSON array. Raw: ${rawText.slice(0, 300)}`,
    );
  }
  const cleaned = jsonMatch[0].trim();

  return JSON.parse(cleaned) as GeminiWord[];
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'vocab_app_db',
    entities: [Vocabulary, VocabularyExample, Category],
    synchronize: false,
    logging: false,
  });

  await dataSource.initialize();
  console.log('✅  Connected to DB');
  console.log(
    `🎯  Generating ${REQUEST_COUNT} words at level ${TARGET_LEVEL}...`,
  );

  const vocabRepo: Repository<Vocabulary> =
    dataSource.getRepository(Vocabulary);

  // Load all existing words (lowercase) for deduplication
  const existingRaw = await vocabRepo
    .createQueryBuilder('v')
    .select('LOWER(v.word)', 'word')
    .getRawMany<{ word: string }>();
  const existingWords = new Set(existingRaw.map((r) => r.word));

  // Also load level-specific words separately so they are prioritized in exclusion
  const levelWordsRaw = await vocabRepo
    .createQueryBuilder('v')
    .select('LOWER(v.word)', 'word')
    .where('v.cefr_level = :level', { level: TARGET_LEVEL })
    .getRawMany<{ word: string }>();
  const levelWords = new Set(levelWordsRaw.map((r) => r.word));

  console.log(
    `📖  ${existingWords.size} words in DB total, ${levelWords.size} at level ${TARGET_LEVEL}`,
  );

  // Call Gemini in batches to avoid response truncation
  const allGeminiWords: GeminiWord[] = [];
  const batchCount = Math.ceil(REQUEST_COUNT / GEMINI_BATCH_SIZE);

  for (let i = 0; i < batchCount; i++) {
    const batchSize = Math.min(
      GEMINI_BATCH_SIZE,
      REQUEST_COUNT - i * GEMINI_BATCH_SIZE,
    );
    console.log(
      `\n🔄  Batch ${i + 1}/${batchCount} — requesting ${batchSize} words...`,
    );

    try {
      // mustExclude = words generated in this run (MUST all be sent to Gemini)
      // samplePool = all DB words (randomly sampled per batch)
      const generatedSoFar = new Set(
        allGeminiWords.map((w) => w.word.toLowerCase()),
      );
      const batch = await callGemini(
        TARGET_LEVEL,
        batchSize,
        generatedSoFar,
        existingWords,
      );
      allGeminiWords.push(...batch);
      console.log(`   ✅  Got ${batch.length} words`);
    } catch (err) {
      console.error(`   ❌  Batch ${i + 1} failed:`, err);
    }

    if (i < batchCount - 1) {
      await new Promise<void>((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  const geminiWords = allGeminiWords;
  console.log(`\n🤖  Gemini returned ${geminiWords.length} words total`);

  // Deduplicate and build entities
  const seenInBatch = new Set<string>();
  let skipped = 0;
  const entities: Vocabulary[] = [];

  for (const item of geminiWords) {
    // Sanitize inputs — prevent injection
    const word = String(item.word ?? '')
      .trim()
      .slice(0, 255);
    const meaningTh = String(item.meaning_th ?? '')
      .trim()
      .slice(0, 1000);
    const pronunciationThai = String(item.pronunciation_thai ?? '')
      .trim()
      .slice(0, 255);
    const ipa = String(item.ipa ?? '')
      .trim()
      .slice(0, 255);
    const posRaw = String(item.part_of_speech ?? '')
      .trim()
      .toLowerCase();
    const exampleEasy = String(item.example_easy ?? '')
      .trim()
      .slice(0, 2000);
    const exampleMedium = String(item.example_medium ?? '')
      .trim()
      .slice(0, 2000);
    const exampleHard = String(item.example_hard ?? '')
      .trim()
      .slice(0, 2000);

    if (!word || !meaningTh) {
      skipped++;
      continue;
    }

    const key = word.toLowerCase();
    if (existingWords.has(key) || seenInBatch.has(key)) {
      console.log(`   ⏭  "${word}" already exists — skipped`);
      skipped++;
      continue;
    }
    seenInBatch.add(key);

    const partOfSpeech = VALID_POS.includes(posRaw)
      ? (posRaw as EPartOfSpeech)
      : EPartOfSpeech.OTHER;

    const examples = [exampleEasy, exampleMedium, exampleHard].filter(
      (s) => s.length > 0,
    );

    const vocab = vocabRepo.create({
      word,
      meaning: meaningTh,
      ipa: ipa || null,
      pronunciationThai: pronunciationThai || null,
      partOfSpeech,
      cefrLevel: TARGET_LEVEL,
    });
    if (examples.length > 0) {
      vocab.examples = examples.map((sentence) =>
        dataSource.getRepository(VocabularyExample).create({ sentence }),
      );
    }
    entities.push(vocab);
  }

  if (entities.length === 0) {
    console.log('\n⚠️   No new words to insert.');
    await dataSource.destroy();
    return;
  }

  // Bulk insert
  await vocabRepo.save(entities);

  console.log(`\n🎉  Done!`);
  console.log(`   Inserted : ${entities.length}`);
  console.log(`   Skipped  : ${skipped}`);
  console.log(`\n💡  Run next:`);
  console.log(`   npm run auto-categorize   → assign categories`);

  await dataSource.destroy();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
