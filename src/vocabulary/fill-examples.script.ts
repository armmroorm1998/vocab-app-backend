/**
 * Fill examples script:
 *   Find vocabularies that have fewer than 3 examples → ask Gemini to generate
 *   easy/medium/hard sentences → insert the missing examples.
 *
 * Run:
 *   npm run fill:examples
 *   npm run fill:examples -- --min 1   (only words with < 1 example, i.e. none)
 *   npm run fill:examples -- --min 3   (words with < 3 examples — default)
 *
 * Requirements:
 *   - GEMINI_API_KEY in .env
 *   - DB credentials in .env
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource, Repository } from 'typeorm';
import { Vocabulary, VocabularyExample } from '../vocabulary/vocabulary.entity';
import { Category } from '../category/category.entity';

dotenv.config();

// ─── Config ──────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌  GEMINI_API_KEY is not set in .env');
  process.exit(1);
}

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
const BATCH_SIZE = 20; // words per Gemini call
const BATCH_DELAY_MS = 2000;

// ─── Parse args ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const getArg = (flag: string): string | undefined => {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : undefined;
};

// min = minimum number of examples a word must have — words below this get filled
const MIN_EXAMPLES = Math.max(
  1,
  Math.min(3, parseInt(getArg('--min') ?? '3', 10)),
);

// ─── Types ───────────────────────────────────────────────────────────────────

interface GeminiExampleResult {
  id: number;
  example_easy: string;
  example_medium: string;
  example_hard: string;
}

// ─── Gemini helper ───────────────────────────────────────────────────────────

async function callGemini(
  words: {
    id: number;
    word: string;
    meaning: string;
    cefrLevel: string | null;
    existingExamples: string[];
  }[],
): Promise<GeminiExampleResult[]> {
  const wordList = words
    .map((w) => {
      const existing =
        w.existingExamples.length > 0
          ? ` (already has: "${w.existingExamples.join('", "')}")`
          : '';
      return `- id: ${w.id}, word: "${w.word}", meaning: "${w.meaning}", level: ${w.cefrLevel ?? 'unknown'}${existing}`;
    })
    .join('\n');

  const prompt = `You are an English vocabulary expert.
For each word below, generate 3 example sentences appropriate for its CEFR level:
- example_easy: short, simple sentence (beginner-friendly)
- example_medium: moderate sentence showing natural usage
- example_hard: complex or idiomatic sentence (advanced)

Do NOT repeat any existing examples listed in parentheses.
Return ONLY a valid JSON array — no markdown, no explanation, no code fences.

Format:
[{"id": <word_id>, "example_easy": "...", "example_medium": "...", "example_hard": "..."}]

Words:
${wordList}`;

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 8192 },
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

  const jsonMatch = rawText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error(
      `Gemini response contains no JSON array. Raw: ${rawText.slice(0, 300)}`,
    );
  }

  return JSON.parse(jsonMatch[0]) as GeminiExampleResult[];
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
    `🎯  Finding words with fewer than ${MIN_EXAMPLES} example(s)...`,
  );

  const vocabRepo: Repository<Vocabulary> =
    dataSource.getRepository(Vocabulary);
  const exampleRepo: Repository<VocabularyExample> =
    dataSource.getRepository(VocabularyExample);

  // Find vocabularies with fewer than MIN_EXAMPLES examples
  const vocabs = await vocabRepo
    .createQueryBuilder('v')
    .leftJoinAndSelect('v.examples', 'ex')
    .getMany();

  const targets = vocabs.filter((v) => v.examples.length < MIN_EXAMPLES);

  if (targets.length === 0) {
    console.log(
      `\n✅  All words already have ${MIN_EXAMPLES}+ examples. Nothing to do.`,
    );
    await dataSource.destroy();
    return;
  }

  console.log(`📝  Found ${targets.length} words to fill`);

  const batchCount = Math.ceil(targets.length / BATCH_SIZE);
  let totalInserted = 0;
  let totalFailed = 0;

  for (let i = 0; i < batchCount; i++) {
    const batch = targets.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
    console.log(
      `\n🔄  Batch ${i + 1}/${batchCount} — ${batch.length} words...`,
    );

    const payload = batch.map((v) => ({
      id: v.id,
      word: v.word,
      meaning: v.meaning,
      cefrLevel: v.cefrLevel,
      existingExamples: v.examples.map((ex) => ex.sentence),
    }));

    try {
      const results = await callGemini(payload);

      // Build a map for quick lookup
      const resultMap = new Map<number, GeminiExampleResult>();
      for (const r of results) {
        resultMap.set(r.id, r);
      }

      for (const vocab of batch) {
        const result = resultMap.get(vocab.id);
        if (!result) {
          console.log(`   ⚠️   id=${vocab.id} "${vocab.word}" — no result`);
          continue;
        }

        const existingSentences = new Set(
          vocab.examples.map((ex) => ex.sentence.toLowerCase().trim()),
        );

        const newSentences = [
          result.example_easy,
          result.example_medium,
          result.example_hard,
        ]
          .map((s) =>
            String(s ?? '')
              .trim()
              .slice(0, 2000),
          )
          .filter(
            (s) => s.length > 0 && !existingSentences.has(s.toLowerCase()),
          );

        // Only insert enough to reach MIN_EXAMPLES
        const needed = MIN_EXAMPLES - vocab.examples.length;
        const toInsert = newSentences.slice(0, needed);

        if (toInsert.length === 0) continue;

        const entities = toInsert.map((sentence) =>
          exampleRepo.create({ sentence, vocabulary: vocab }),
        );
        await exampleRepo.save(entities);
        totalInserted += entities.length;
        console.log(`   ✅  "${vocab.word}" +${entities.length} example(s)`);
      }
    } catch (err) {
      console.error(`   ❌  Batch ${i + 1} failed:`, err);
      totalFailed += batch.length;
    }

    if (i < batchCount - 1) {
      await new Promise<void>((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  console.log(`\n🎉  Done!`);
  console.log(`   Inserted : ${totalInserted} examples`);
  console.log(`   Failed   : ${totalFailed} words`);

  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
