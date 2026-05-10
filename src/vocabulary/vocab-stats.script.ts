/**
 * Vocab stats script: show how many vocabularies exist per CEFR level and category.
 *
 * Run: npm run vocab:stats
 *
 * Requirements:
 *   - DB credentials in .env
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Vocabulary, VocabularyExample } from '../vocabulary/vocabulary.entity';
import { Category } from '../category/category.entity';

dotenv.config();

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

  // ─── Total ───────────────────────────────────────────────────────────────
  const total = await dataSource.getRepository(Vocabulary).count();
  console.log(`\n📚  Total vocabularies: ${total}\n`);

  // ─── By CEFR level ───────────────────────────────────────────────────────
  const byLevel = await dataSource
    .getRepository(Vocabulary)
    .createQueryBuilder('v')
    .select('v.cefr_level', 'level')
    .addSelect('COUNT(*)', 'count')
    .groupBy('v.cefr_level')
    .orderBy('v.cefr_level', 'ASC', 'NULLS LAST')
    .getRawMany<{ level: string | null; count: string }>();

  console.log('── By CEFR Level ─────────────────────────────');
  const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const levelMap = new Map(
    byLevel.map((r) => [r.level ?? 'null', Number(r.count)]),
  );

  const TARGET = 200; // desired words per level
  for (const lvl of LEVELS) {
    const count = levelMap.get(lvl) ?? 0;
    const bar = '█'.repeat(Math.min(Math.floor(count / 5), 40));
    const missing = Math.max(0, TARGET - count);
    const status = count >= TARGET ? '✅' : '⚠️ ';
    console.log(
      `  ${status}  ${lvl}  ${String(count).padStart(4)} / ${TARGET}  ${bar}${missing > 0 ? `  (need ${missing} more)` : ''}`,
    );
  }
  const noLevel = levelMap.get('null') ?? 0;
  if (noLevel > 0) {
    console.log(
      `\n  ❓  No level assigned: ${noLevel} words  → run: npm run auto-level`,
    );
  }

  // ─── By Category ─────────────────────────────────────────────────────────
  const byCategory = await dataSource
    .getRepository(Vocabulary)
    .createQueryBuilder('v')
    .leftJoin('v.category', 'c')
    .select("COALESCE(c.name, '(no category)')", 'category')
    .addSelect('COUNT(*)', 'count')
    .groupBy('c.name')
    .orderBy('count', 'DESC')
    .getRawMany<{ category: string; count: string }>();

  console.log('\n── By Category ───────────────────────────────');
  for (const row of byCategory) {
    console.log(`  ${String(row.count).padStart(4)}  ${row.category}`);
  }

  console.log('');
  await dataSource.destroy();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
