/**
 * Backfill script: finds all conversation_quiz_questions where choice_scores IS NULL,
 * sends them to Gemini (or OpenAI) to get naturalness scores (0–3) for each choice,
 * then updates the database in place.
 *
 * Usage:
 *   npm run conversation:backfill-scores
 *   npm run conversation:backfill-scores -- --batch=5   (questions per AI call, default 5)
 *   npm run conversation:backfill-scores -- --dry-run   (print updates without saving)
 */

import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource, IsNull } from 'typeorm';
import { ConversationQuizCategory, ConversationQuizQuestion } from './conversation-quiz.entity';

dotenv.config();

const DEFAULT_BATCH_SIZE = 5;
const GEMINI_MODEL = 'gemini-2.5-flash';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

type ScoreResult = {
  id: number;
  choiceScores: Record<string, number>;
};

function getArgValue(flag: string): string | undefined {
  const exact = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (exact) return exact.slice(flag.length + 1);
  const index = process.argv.findIndex((arg) => arg === flag);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return undefined;
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function buildScorePrompt(
  questions: { id: number; prompt: string; choices: string[] }[],
): string {
  const questionList = questions
    .map((q, i) =>
      [
        `Question ${i + 1} (id: ${q.id})`,
        `Prompt: "${q.prompt}"`,
        `Choices:`,
        ...q.choices.map((c, ci) => `  ${ci + 1}. "${c}"`),
      ].join('\n'),
    )
    .join('\n\n');

  return [
    'You are an expert English conversation teacher.',
    'For each question below, assign a naturalness score (0–3) to EVERY choice.',
    'All choices are valid responses — score them by how natural a native speaker would say them:',
    '  3 = most natural / fluent (native speaker would say this)',
    '  2 = natural and acceptable',
    '  1 = understandable but slightly awkward or overly formal/informal',
    '  0 = technically understandable but very unnatural',
    'Exactly one choice per question should score 3.',
    '',
    'Return ONLY a JSON object in this exact format:',
    '{"results": [{"id": <question_id>, "choiceScores": {"<choice text>": <score>, ...}}, ...]}',
    '',
    'Questions:',
    questionList,
  ].join('\n');
}

function parseScorePayload(rawText: string): ScoreResult[] {
  const candidates: string[] = [rawText];

  const fenced = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) candidates.push(fenced[1]);

  const firstBrace = rawText.indexOf('{');
  const lastBrace = rawText.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    candidates.push(rawText.slice(firstBrace, lastBrace + 1));
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as { results?: unknown };
      const results = parsed.results;
      if (!Array.isArray(results)) continue;

      return results
        .filter(
          (r) =>
            r &&
            typeof r === 'object' &&
            typeof (r as { id?: unknown }).id === 'number' &&
            (r as { choiceScores?: unknown }).choiceScores &&
            typeof (r as { choiceScores?: unknown }).choiceScores === 'object',
        )
        .map((r) => {
          const row = r as { id: number; choiceScores: Record<string, unknown> };
          const choiceScores: Record<string, number> = {};
          for (const [k, v] of Object.entries(row.choiceScores)) {
            if (typeof v === 'number') choiceScores[k] = v;
          }
          return { id: row.id, choiceScores };
        })
        .filter((r) => Object.keys(r.choiceScores).length > 0);
    } catch {
      // try next candidate
    }
  }

  throw new Error('Failed to parse score response from model');
}

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

  const modelCandidates = [
    GEMINI_MODEL,
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
  ];

  let lastError = '';
  for (const model of modelCandidates) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      lastError = `Gemini ${model}: ${response.status} ${errText}`;
      if (response.status === 404) continue;
      throw new Error(lastError);
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error(`Gemini returned empty content for model ${model}`);
    return text;
  }

  throw new Error(lastError || 'No Gemini model available');
}

async function callOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is missing');

  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'You are an expert English conversation teacher.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI error: ${response.status} ${errText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned empty content');
  return content;
}

async function askModelForScores(
  questions: { id: number; prompt: string; choices: string[] }[],
): Promise<ScoreResult[]> {
  const prompt = buildScorePrompt(questions);

  const rawText = process.env.GEMINI_API_KEY
    ? await callGemini(prompt)
    : await callOpenAI(prompt);

  return parseScorePayload(rawText);
}

async function main() {
  const batchArg = getArgValue('--batch');
  const batchSize = Number(batchArg ?? DEFAULT_BATCH_SIZE);
  const isDryRun = hasFlag('--dry-run');

  if (!Number.isFinite(batchSize) || batchSize <= 0) {
    throw new Error('--batch must be a positive number');
  }

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'vocab_app_db',
    entities: [ConversationQuizCategory, ConversationQuizQuestion],
    synchronize: false,
  });

  await dataSource.initialize();
  const repo = dataSource.getRepository(ConversationQuizQuestion);

  const nullQuestions = await repo.find({
    where: { choiceScores: IsNull() },
    order: { id: 'ASC' },
  });

  if (nullQuestions.length === 0) {
    console.log('✅ No questions with null choice_scores found. Nothing to do.');
    await dataSource.destroy();
    return;
  }

  console.log(
    `Found ${nullQuestions.length} questions with null choice_scores. Batch size: ${batchSize}${isDryRun ? ' [DRY RUN]' : ''}\n`,
  );

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < nullQuestions.length; i += batchSize) {
    const batch = nullQuestions.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(nullQuestions.length / batchSize);

    console.log(`Batch ${batchNum}/${totalBatches}: processing question ids [${batch.map((q) => q.id).join(', ')}]`);

    let results: ScoreResult[];
    try {
      results = await askModelForScores(
        batch.map((q) => ({ id: q.id, prompt: q.prompt, choices: q.choices })),
      );
    } catch (err) {
      console.error(`  ❌ Batch ${batchNum} failed:`, err);
      failed += batch.length;
      continue;
    }

    // Map results by id for quick lookup
    const resultMap = new Map(results.map((r) => [r.id, r.choiceScores]));

    for (const q of batch) {
      const scores = resultMap.get(q.id);
      if (!scores) {
        console.warn(`  ⚠️  No scores returned for question id ${q.id} — skipping`);
        failed++;
        continue;
      }

      if (isDryRun) {
        console.log(`  [DRY RUN] id ${q.id}: ${JSON.stringify(scores)}`);
        updated++;
        continue;
      }

      try {
        await repo.update(q.id, { choiceScores: scores });
        console.log(`  ✅ Updated id ${q.id}`);
        updated++;
      } catch (err) {
        console.error(`  ❌ Failed to update id ${q.id}:`, err);
        failed++;
      }
    }
  }

  console.log(
    `\nDone. Updated: ${updated}, Failed: ${failed}`,
  );

  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
