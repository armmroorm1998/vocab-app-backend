/**
 * Grant (or revoke) admin access for a user by uid.
 * Kept as a standalone script rather than an HTTP endpoint — there should
 * be no API path that lets anyone self-promote to admin.
 *
 * Run:
 *   npm run set-admin -- --uid <uid>
 *   npm run set-admin -- --uid <uid> --revoke
 *
 * Requirements:
 *   - DB credentials in .env (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME)
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './user.entity';

dotenv.config();

const args = process.argv.slice(2);
const getArg = (flag: string): string | undefined => {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : undefined;
};

const uid = getArg('--uid');
const revoke = args.includes('--revoke');

if (!uid) {
  console.error(
    '❌  --uid is required. Usage: npm run set-admin -- --uid <uid>',
  );
  process.exit(1);
}

async function main() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'vocab_app_db',
    entities: [User],
    synchronize: false,
  });

  await dataSource.initialize();
  const repo = dataSource.getRepository(User);

  const user = await repo.findOne({ where: { uid } });
  if (!user) {
    console.error(`❌  No user found with uid "${uid}"`);
    await dataSource.destroy();
    process.exit(1);
  }

  user.isAdmin = !revoke;
  await repo.save(user);

  console.log(
    `✅  ${user.displayName ?? user.uid} is now ${revoke ? 'NOT ' : ''}an admin`,
  );
  await dataSource.destroy();
}

main().catch((err) => {
  console.error('❌  Failed:', err);
  process.exit(1);
});
