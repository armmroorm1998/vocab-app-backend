/**
 * Auto-categorize script:
 *   Fetch vocabularies without a category → batch-send to Gemini →
 *   update each vocabulary's category_id in DB.
 *
 * Run: npm run auto-categorize
 *
 * Requirements:
 *   - GEMINI_API_KEY in .env
 *   - DB credentials in .env (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME)
 *   - Categories already seeded (npm run seed:categories)
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { Vocabulary, VocabularyExample } from '../vocabulary/vocabulary.entity';
import { Category } from './category.entity';

dotenv.config();

// ─── Config ──────────────────────────────────────────────────────────────────

// Parse CLI flags
//   --recategorize          re-classify ALL words (not just uncategorized ones)
//   --category <name>       limit --recategorize to words in this category only
const cliArgs = process.argv.slice(2);
const RECATEGORIZE = cliArgs.includes('--recategorize');
const CATEGORY_FILTER = (() => {
  const idx = cliArgs.indexOf('--category');
  return idx !== -1 ? cliArgs[idx + 1] : null;
})();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌  GEMINI_API_KEY is not set in .env');
  process.exit(1);
}

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
const BATCH_SIZE = 25;
const BATCH_DELAY_MS = 2000;

// ─── Types ───────────────────────────────────────────────────────────────────

interface GeminiCategoryResult {
  id: number;
  category: string; // must match Category.name exactly, or "none"
}

// ─── Gemini helper ───────────────────────────────────────────────────────────

async function callGemini(
  words: { id: number; word: string; meaning: string }[],
  categories: Category[],
): Promise<GeminiCategoryResult[]> {
  const categoryList = categories
    .map((c) => `- ${c.name}${c.nameTh ? ` (${c.nameTh})` : ''}`)
    .join('\n');

  const prompt = `You are a strict vocabulary classification assistant.
Given the list of English vocabulary words and their Thai meanings, assign each word to the most appropriate category from the list below.

CRITICAL RULES:
1. Only assign a category if the word's PRIMARY meaning directly and specifically belongs to that category.
2. Do NOT assign a category just because the word "can be used in" that context or appears in academic texts about that topic.
3. General/academic/abstract words that merely relate to a topic must be "none" — even if they sound topically connected.
4. When in doubt, use "none".

Examples of correct classification:
- "lion" → Animals  (primary meaning IS the animal)
- "feather" → Animals  (primary meaning is a body part of a bird)
- "rehabilitation" → none  (general word; used across medicine, law, etc. — not exclusively Animals)
- "pinnacle" → none  (general abstract word, not specific to any category)
- "ecosystem" → none  (environmental science term, not a specific Animals/Nature word in these categories)
- "encroachment" → none  (legal/environmental term; does not primarily belong to any listed category)

Available categories (use the exact English name):
${categoryList}

Return ONLY a valid JSON array — no markdown, no explanation, no code fences.

Format:
[{"id": <word_id>, "category": "<exact category name or none>"}]

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

  return JSON.parse(cleaned) as GeminiCategoryResult[];
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
  const categoryRepo: Repository<Category> = dataSource.getRepository(Category);

  // Load all available categories
  const categories = await categoryRepo.find({ order: { name: 'ASC' } });
  if (categories.length === 0) {
    console.error(
      '❌  No categories found. Run: npm run seed:categories first',
    );
    await dataSource.destroy();
    process.exit(1);
  }
  console.log(
    `📂  Loaded ${categories.length} categories: ${categories.map((c) => c.name).join(', ')}`,
  );

  // Build a lookup map: category name (lowercase) → Category entity
  const categoryMap = new Map<string, Category>(
    categories.map((c) => [c.name.toLowerCase(), c]),
  );

  // Determine which vocabularies to process
  let allVocabs: { id: number; word: string; meaning: string }[];

  if (RECATEGORIZE) {
    // Re-categorize mode: process words that already have a category
    if (CATEGORY_FILTER) {
      const targetCat = await categoryRepo.findOne({
        where: { name: CATEGORY_FILTER },
      });
      if (!targetCat) {
        console.error(
          `❌  Category "${CATEGORY_FILTER}" not found. Available: ${categories.map((c) => c.name).join(', ')}`,
        );
        await dataSource.destroy();
        process.exit(1);
      }
      console.log(
        `🔁  Re-categorize mode — category filter: "${CATEGORY_FILTER}"`,
      );
      allVocabs = await vocabRepo.find({
        where: { category: { id: targetCat.id } },
        select: { id: true, word: true, meaning: true },
        order: { id: 'ASC' },
      });
    } else {
      console.log('🔁  Re-categorize mode — all categorized words');
      allVocabs = await vocabRepo.find({
        where: { category: Not(IsNull()) },
        select: { id: true, word: true, meaning: true },
        order: { id: 'ASC' },
      });
    }
    console.log(`📚  Found ${allVocabs.length} vocabularies to re-classify`);
  } else {
    // Default mode: only uncategorized words
    allVocabs = await vocabRepo.find({
      where: { category: IsNull() },
      select: { id: true, word: true, meaning: true },
      order: { id: 'ASC' },
    });
    console.log(
      `📚  Found ${allVocabs.length} vocabularies without a category`,
    );
  }

  if (allVocabs.length === 0) {
    console.log('✅  All vocabularies are already categorized. Nothing to do.');
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
      const results = await callGemini(batch, categories);

      for (const result of results) {
        const vocab = batch.find((v) => v.id === result.id);
        if (!vocab) {
          console.warn(`   ⚠️  id ${result.id} not found in batch — skipped`);
          totalSkipped++;
          continue;
        }

        const categoryName = result.category?.toLowerCase?.() ?? 'none';
        if (categoryName === 'none' || !categoryName) {
          if (RECATEGORIZE) {
            // In recategorize mode: set category to null (word doesn't belong to any category)
            await vocabRepo.update(vocab.id, { category: null });
            console.log(
              `   🔓  "${vocab.word}" → uncategorized (no primary match)`,
            );
            totalUpdated++;
          } else {
            console.log(`   ⏭  "${vocab.word}" → no matching category`);
            totalSkipped++;
          }
          continue;
        }

        const category = categoryMap.get(categoryName);
        if (!category) {
          console.warn(
            `   ⚠️  "${vocab.word}" → unknown category "${result.category}" — skipped`,
          );
          totalSkipped++;
          continue;
        }

        // Parameterized update — safe from SQL injection
        await vocabRepo.update(vocab.id, { category });
        console.log(`   ✅  "${vocab.word}" → ${category.name}`);
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

  const modeLabel = RECATEGORIZE
    ? CATEGORY_FILTER
      ? `re-categorize "${CATEGORY_FILTER}"`
      : 're-categorize all'
    : 'categorize new';
  console.log(
    `\n🎉  Done [${modeLabel}]! Updated: ${totalUpdated}  |  Skipped (no change): ${totalSkipped}  |  Failed: ${totalFailed}`,
  );

  await dataSource.destroy();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
