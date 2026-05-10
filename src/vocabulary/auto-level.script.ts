/**
 * Auto-level script:
 *   Fetch vocabularies without a CEFR level → batch-send to Gemini →
 *   update each vocabulary's cefr_level in DB.
 *
 * Run: npm run auto-level
 *
 * Requirements:
 *   - GEMINI_API_KEY in .env
 *   - DB credentials in .env (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME)
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource, IsNull, Repository } from 'typeorm';
import {
  Vocabulary,
  VocabularyExample,
  ECefrLevel,
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
const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 2000;

const VALID_LEVELS = Object.values(ECefrLevel) as string[];

// ─── Types ───────────────────────────────────────────────────────────────────

interface GeminiLevelResult {
  id: number;
  level: string; // A1 | A2 | B1 | B2 | C1 | C2
}

// ─── Gemini helper ───────────────────────────────────────────────────────────

async function callGemini(
  words: { id: number; word: string; meaning: string }[],
): Promise<GeminiLevelResult[]> {
  const prompt = `You are an English vocabulary level classifier using the CEFR standard.
For each word below, classify it as one of: A1, A2, B1, B2, C1, C2.

Guidelines:
- A1: Most basic everyday words (e.g. cat, eat, big, go)
- A2: Simple common words (e.g. hospital, always, cheap)
- B1: Intermediate words used in general conversation (e.g. negotiate, recommend)
- B2: Upper-intermediate words found in formal/written contexts (e.g. sustainable, implication)
- C1: Advanced words (e.g. rhetoric, pragmatic, ambiguous)
- C2: Near-native proficiency words, rare or academic (e.g. ephemeral, soliloquy)

Return ONLY a valid JSON array — no markdown, no explanation, no code fences.

Format:
[{"id": <word_id>, "level": "<A1|A2|B1|B2|C1|C2>"}]

Words to classify:
${words.map((w) => `- id: ${w.id}, word: "${w.word}", meaning: "${w.meaning}"`).join('\n')}`;

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 4096 },
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

  // Strip markdown code fences if Gemini adds them despite instructions
  const cleaned = rawText
    .replace(/^```(?:json)?\n?/, '')
    .replace(/\n?```$/, '')
    .trim();

  return JSON.parse(cleaned) as GeminiLevelResult[];
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

  const vocabRepo: Repository<Vocabulary> =
    dataSource.getRepository(Vocabulary);

  // Fetch only vocabularies that have no CEFR level yet
  const allVocabs = await vocabRepo.find({
    where: { cefrLevel: IsNull() },
    select: { id: true, word: true, meaning: true },
    order: { id: 'ASC' },
  });

  console.log(
    `📚  Found ${allVocabs.length} vocabularies without a CEFR level`,
  );

  if (allVocabs.length === 0) {
    console.log(
      '✅  All vocabularies already have a CEFR level. Nothing to do.',
    );
    await dataSource.destroy();
    return;
  }

  const batchCount = Math.ceil(allVocabs.length / BATCH_SIZE);
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (let i = 0; i < batchCount; i++) {
    const batch = allVocabs.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
    console.log(
      `\n🔄  Batch ${i + 1}/${batchCount} — ${batch.length} words...`,
    );

    try {
      const results = await callGemini(batch);

      for (const result of results) {
        const vocab = batch.find((v) => v.id === result.id);
        if (!vocab) {
          console.warn(`   ⚠️  id ${result.id} not found in batch — skipped`);
          totalSkipped++;
          continue;
        }

        const level = result.level?.toUpperCase?.() ?? '';
        if (!VALID_LEVELS.includes(level)) {
          console.warn(
            `   ⚠️  "${vocab.word}" → unknown level "${result.level}" — skipped`,
          );
          totalSkipped++;
          continue;
        }

        // Parameterized update — safe from SQL injection
        await vocabRepo.update(vocab.id, {
          cefrLevel: level as ECefrLevel,
        });
        console.log(`   ✅  "${vocab.word}" → ${level}`);
        totalUpdated++;
      }
    } catch (err) {
      console.error(`   ❌  Batch ${i + 1} failed:`, err);
      totalFailed += batch.length;
    }

    if (i < batchCount - 1) {
      await new Promise<void>((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  console.log(
    `\n🎉  Done! Updated: ${totalUpdated}  |  Skipped (invalid): ${totalSkipped}  |  Failed: ${totalFailed}`,
  );

  await dataSource.destroy();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
