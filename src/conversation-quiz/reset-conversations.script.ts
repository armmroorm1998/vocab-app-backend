import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import {
  ConversationQuizCategory,
  ConversationQuizQuestion,
} from './conversation-quiz.entity';

dotenv.config();

function getArgValue(flag: string): string | undefined {
  const exact = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (exact) return exact.slice(flag.length + 1);

  const index = process.argv.findIndex((arg) => arg === flag);
  if (index >= 0 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }

  return undefined;
}

async function main() {
  const categoryKey = getArgValue('--category') ?? getArgValue('-c');

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

  if (categoryKey) {
    const category = await categoryRepo.findOne({
      where: { key: categoryKey },
    });
    if (!category) {
      throw new Error(`Category not found for key: ${categoryKey}`);
    }

    const result = await questionRepo.delete({ category: { id: category.id } });
    console.log(
      `Conversation reset done for ${category.key}: deleted=${result.affected ?? 0}`,
    );
  } else {
    await questionRepo.clear();
    console.log(
      'Conversation reset done: deleted all conversation_quiz_questions',
    );
  }

  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Conversation reset failed:', err);
  process.exit(1);
});
