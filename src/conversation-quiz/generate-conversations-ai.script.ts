import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import {
  ConversationQuizCategory,
  ConversationQuizDialogueLine,
  ConversationQuizQuestion,
} from './conversation-quiz.entity';

dotenv.config();

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const DEFAULT_CONVERSATION_CATEGORY_KEY = 'all';
const DEFAULT_CONVERSATION_GENERATE_COUNT = 10;

type GeneratedQuestion = {
  speaker: string;
  prompt: string;
  choices: string[];
  correctAnswer: string;
  naturalAnswer: string;
  dialogueLines?: ConversationQuizDialogueLine[];
};

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

function getArgValue(flag: string): string | undefined {
  const exact = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (exact) return exact.slice(flag.length + 1);

  const index = process.argv.findIndex((arg) => arg === flag);
  if (index >= 0 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }

  return undefined;
}

function buildPrompt(categoryName: string, count: number): string {
  return [
    'Generate English conversation multiple-choice quiz items as JSON only.',
    `Category: ${categoryName}`,
    `Count: ${count}`,
    'Each item must contain speaker, prompt, choices(4), correctAnswer, naturalAnswer, dialogueLines.',
    'The conversation must feel complete from start to finish, not like a single isolated question.',
    'Use two primary speakers who alternate naturally in the conversation.',
    'The default structure should be a 2-person dialogue: one side speaks, the other side replies, and so on.',
    'Only introduce a third speaker if the category truly needs it, such as a transfer, group meeting, or a helper role that is essential to the scene.',
    'If you use a third speaker, keep the conversation easy to follow and still center the dialogue around the two main speakers.',
    'Each dialogue turn must clearly reference the previous turn. Do not write disconnected lines.',
    'Use natural follow-up words or pronouns such as this, that, it, there, then, OK, sure, thanks, or the earlier topic so the flow feels continuous.',
    'Avoid jumping to a new topic unless the previous line naturally leads to it.',
    'Each dialogue should include: 1) a natural opener/greeting, 2) the main request or question, 3) the learner response, 4) a follow-up or confirmation, and 5) a natural closing.',
    'Make the flow realistic for the category. For example: travel should include trip context, hotel should include check-in or requests, restaurant should include ordering flow, job interview should include introduction and follow-up.',
    'All choices should be short realistic sentence responses that fit the specific moment in the conversation.',
    'naturalAnswer should be a fluent answer, may be same as correctAnswer.',
    'dialogueLines must be 5 to 7 turns.',
    'One dialogueLines turn must contain the exact prompt as spoken by the other person.',
    'One dialogueLines turn must contain the learner answer as a "You" turn, matching naturalAnswer.',
    'The final turn should close the exchange naturally.',
    'If a line mentions an object, place, time, or action, the next line should respond to that exact detail.',
    'Each dialogueLines item must contain speaker and text.',
    'Avoid repetitive placeholders and avoid generic lines that could belong to any category.',
    'Return JSON object: {"questions":[...]}',
  ].join('\n');
}

function buildFallbackDialogueLines(
  question: Pick<GeneratedQuestion, 'speaker' | 'prompt' | 'naturalAnswer'>,
): ConversationQuizDialogueLine[] {
  return [
    { speaker: question.speaker, text: 'Hi, I have a question for you.' },
    { speaker: question.speaker, text: question.prompt },
    { speaker: 'You', text: question.naturalAnswer },
    { speaker: question.speaker, text: 'Thanks, that helps a lot.' },
  ];
}

function normalizeQuestions(input: unknown): GeneratedQuestion[] {
  if (!Array.isArray(input) || input.length === 0) {
    throw new Error('Model response does not contain valid questions array');
  }

  const normalized = input
    .filter(
      (q) =>
        q &&
        typeof q === 'object' &&
        typeof (q as { prompt?: unknown }).prompt === 'string' &&
        Array.isArray((q as { choices?: unknown }).choices) &&
        ((q as { choices?: unknown[] }).choices?.length ?? 0) === 4 &&
        typeof (q as { correctAnswer?: unknown }).correctAnswer === 'string' &&
        typeof (q as { naturalAnswer?: unknown }).naturalAnswer === 'string',
    )
    .map((q) => {
      const row = q as GeneratedQuestion;
      const dialogueLines = Array.isArray(
        (q as { dialogueLines?: unknown }).dialogueLines,
      )
        ? (
            q as { dialogueLines: Array<{ speaker?: unknown; text?: unknown }> }
          ).dialogueLines
            .filter(
              (line) =>
                line &&
                typeof line.speaker === 'string' &&
                typeof line.text === 'string',
            )
            .map((line) => ({
              speaker: String(line.speaker).trim(),
              text: String(line.text).trim(),
            }))
            .filter((line) => line.speaker && line.text)
        : [];

      return {
        speaker: row.speaker || 'Interviewer',
        prompt: row.prompt.trim(),
        choices: row.choices.map((c) => String(c).trim()).slice(0, 4),
        correctAnswer: row.correctAnswer.trim(),
        naturalAnswer: row.naturalAnswer.trim(),
        dialogueLines:
          dialogueLines.length >= 4
            ? dialogueLines.slice(0, 6)
            : buildFallbackDialogueLines(row),
      };
    });

  if (normalized.length === 0) {
    throw new Error('Model response questions are invalid after normalization');
  }

  return normalized;
}

function parseQuestionsPayload(rawText: string): GeneratedQuestion[] {
  const candidates: string[] = [rawText];

  // Handle models that wrap JSON with markdown fences.
  const fenced = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    candidates.push(fenced[1]);
  }

  // Handle extra text before/after JSON object.
  const firstBrace = rawText.indexOf('{');
  const lastBrace = rawText.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    candidates.push(rawText.slice(firstBrace, lastBrace + 1));
  }

  let lastError: unknown;

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as { questions?: unknown };
      return normalizeQuestions(parsed.questions);
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(`Failed to parse model JSON payload: ${String(lastError)}`);
}

async function askGemini(
  categoryName: string,
  count: number,
): Promise<GeneratedQuestion[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing in environment');
  }

  const configuredModel = DEFAULT_GEMINI_MODEL;
  const modelCandidates = [
    configuredModel,
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
  ].filter((model, idx, arr): model is string => {
    if (!model) return false;
    return arr.indexOf(model) === idx;
  });

  let lastError = '';

  for (const model of modelCandidates) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: buildPrompt(categoryName, count) }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      lastError = `Gemini API error with model ${model}: ${response.status} ${errorText}`;
      // Try next candidate when model is unsupported/not found.
      if (response.status === 404) {
        continue;
      }
      throw new Error(lastError);
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error(`Gemini returned empty content with model ${model}`);
    }

    try {
      return parseQuestionsPayload(text);
    } catch (err) {
      lastError = `Gemini parse error with model ${model}: ${String(err)}`;
      continue;
    }
  }

  throw new Error(
    lastError ||
      'No available Gemini model could be used. Please update GEMINI_MODEL.',
  );
}

async function askModel(
  categoryName: string,
  count: number,
): Promise<GeneratedQuestion[]> {
  if (process.env.GEMINI_API_KEY) {
    const retries = 2;
    let lastError: unknown;
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        return await askGemini(categoryName, count);
      } catch (err) {
        lastError = err;
        if (attempt <= retries) {
          console.warn(
            `Gemini attempt ${attempt} failed for ${categoryName}, retrying...`,
          );
        }
      }
    }
    throw lastError;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY or OPENAI_API_KEY is required');
  }

  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: 'You are an expert English conversation teacher.',
        },
        { role: 'user', content: buildPrompt(categoryName, count) },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI returned empty content');
  }

  return parseQuestionsPayload(content);
}

async function main() {
  const categoryKeyArg =
    getArgValue('--category') ?? getArgValue('-c') ?? process.argv[2];
  const categoryKey =
    (categoryKeyArg ?? '').trim() || DEFAULT_CONVERSATION_CATEGORY_KEY;
  const countArg = getArgValue('--count') ?? getArgValue('-n');
  const count = Number(countArg ?? DEFAULT_CONVERSATION_GENERATE_COUNT);

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

  const categoryRepo = dataSource.getRepository(ConversationQuizCategory);
  const questionRepo = dataSource.getRepository(ConversationQuizQuestion);

  if (!Number.isFinite(count) || count <= 0) {
    throw new Error(
      'CONVERSATION_GENERATE_COUNT (or --count) must be a positive number',
    );
  }

  const allCategories = await categoryRepo.find({
    order: { displayOrder: 'ASC' },
  });
  if (allCategories.length === 0) {
    throw new Error(
      'No conversation categories found. Run conversation:seed first.',
    );
  }

  const targetCategories =
    categoryKey === 'all'
      ? allCategories
      : allCategories.filter((c) => c.key === categoryKey);

  if (targetCategories.length === 0) {
    const keys = allCategories.map((c) => c.key).join(', ');
    throw new Error(
      `Category not found for key: ${categoryKey}. Available: ${keys}`,
    );
  }

  let totalInserted = 0;
  let failedCategories = 0;

  for (const category of targetCategories) {
    let generated: GeneratedQuestion[];
    try {
      generated = await askModel(category.name, count);
    } catch (err) {
      failedCategories++;
      console.error(`AI generation failed for category ${category.key}:`, err);
      continue;
    }

    const existingCount = await questionRepo.count({
      where: { category: { id: category.id } },
    });
    let inserted = 0;

    for (let i = 0; i < generated.length; i++) {
      const q = generated[i];
      const exists = await questionRepo.findOne({
        where: { category: { id: category.id }, prompt: q.prompt },
        relations: { category: true },
      });
      if (exists) continue;

      await questionRepo.save(
        questionRepo.create({
          category,
          speaker: q.speaker,
          prompt: q.prompt,
          choices: q.choices,
          correctAnswer: q.correctAnswer,
          naturalAnswer: q.naturalAnswer,
          dialogueLines: q.dialogueLines ?? buildFallbackDialogueLines(q),
          orderIndex: existingCount + i + 1,
        }),
      );
      inserted++;
    }

    totalInserted += inserted;
    console.log(
      `AI generation completed for ${category.key}. Inserted ${inserted} questions.`,
    );
  }

  console.log(
    `AI generation completed. Total inserted ${totalInserted} questions. Failed categories: ${failedCategories}.`,
  );
  await dataSource.destroy();
}

main().catch((err) => {
  console.error('AI generation failed:', err);
  process.exit(1);
});
