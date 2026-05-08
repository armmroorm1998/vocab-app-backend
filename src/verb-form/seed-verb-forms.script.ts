/**
 * Seed script: fetch all verbs from DB → call Gemini → save V1/V2/V3 to verb_forms table.
 *
 * Run: npm run seed:verb-forms
 *
 * Requirements:
 *   - GEMINI_API_KEY in .env
 *   - DB credentials in .env (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME)
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource, Repository } from 'typeorm';
import {
  Vocabulary,
  VocabularyExample,
  EPartOfSpeech,
} from '../vocabulary/vocabulary.entity';
import { VerbForm } from './verb-form.entity';

dotenv.config();

// ─── Config ──────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌  GEMINI_API_KEY is not set in .env');
  process.exit(1);
}

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
const BATCH_SIZE = 50; // verbs per Gemini request
const BATCH_DELAY_MS = 2000; // wait between batches to respect rate limits

// ─── Types ───────────────────────────────────────────────────────────────────

interface GeminiVerbResult {
  word: string;
  v2: string;
  v3: string;
  type: 'regular' | 'irregular';
}

// ─── Gemini helper ───────────────────────────────────────────────────────────

async function callGemini(
  verbs: { word: string; meaning: string }[],
): Promise<GeminiVerbResult[]> {
  const prompt = `You are an English grammar assistant.
For each verb listed below, provide the V2 (simple past) and V3 (past participle) forms, and classify it as "regular" or "irregular".

Return ONLY a valid JSON array — no markdown, no explanation, no code fences.

Example output format:
[{"word":"go","v2":"went","v3":"gone","type":"irregular"},{"word":"walk","v2":"walked","v3":"walked","type":"regular"}]

Verbs to process:
${verbs.map((v, i) => `${i + 1}. ${v.word} (${v.meaning})`).join('\n')}`;

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 2000 },
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

  return JSON.parse(cleaned) as GeminiVerbResult[];
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
    entities: [Vocabulary, VocabularyExample, VerbForm],
    synchronize: true, // creates verb_forms table if it doesn't exist yet
    logging: false,
  });

  await dataSource.initialize();
  console.log('✅  Connected to DB');

  const verbRepo: Repository<Vocabulary> = dataSource.getRepository(Vocabulary);
  const verbFormRepo: Repository<VerbForm> = dataSource.getRepository(VerbForm);

  // Fetch every verb from vocabularies table
  const allVerbs = await verbRepo.find({
    where: { partOfSpeech: EPartOfSpeech.VERB },
    select: { id: true, word: true, meaning: true },
  });
  console.log(`📚  Found ${allVerbs.length} verbs in vocabularies table`);

  if (allVerbs.length === 0) {
    console.log(
      '⚠️   No verbs found. Add vocabulary data with part_of_speech = "verb" first.',
    );
    await dataSource.destroy();
    return;
  }

  // Clear previous seed data
  await verbFormRepo.clear();
  console.log('🗑️   Cleared existing verb_forms table');

  // Process in batches
  const batchCount = Math.ceil(allVerbs.length / BATCH_SIZE);
  let totalSaved = 0;
  let totalFailed = 0;

  for (let i = 0; i < batchCount; i++) {
    const batch = allVerbs.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
    console.log(
      `\n🔄  Batch ${i + 1}/${batchCount} — processing ${batch.length} verbs...`,
    );

    try {
      const results = await callGemini(
        batch.map((v) => ({ word: v.word, meaning: v.meaning })),
      );

      const entities = results.map((r) => {
        // Match meaning from original DB row (case-insensitive)
        const original = batch.find(
          (v) => v.word.toLowerCase() === r.word.toLowerCase(),
        );
        return verbFormRepo.create({
          word: r.word,
          meaning: original?.meaning ?? r.word,
          v2: r.v2,
          v3: r.v3,
        });
      });

      await verbFormRepo.save(entities);
      totalSaved += entities.length;
      console.log(`   ✅  Saved ${entities.length} verb forms`);
    } catch (err) {
      console.error(`   ❌  Batch ${i + 1} failed:`, err);
      totalFailed += batch.length;
    }

    // Respect Gemini rate limits between batches
    if (i < batchCount - 1) {
      await new Promise<void>((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  console.log(
    `\n🎉  Done! Saved: ${totalSaved}  |  Failed: ${totalFailed}  |  Total verbs: ${allVerbs.length}`,
  );

  await dataSource.destroy();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
