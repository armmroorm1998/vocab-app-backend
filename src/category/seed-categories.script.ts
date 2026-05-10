/**
 * Seed script: insert default vocabulary categories into the `categories` table.
 *
 * Run: npm run seed:categories
 *
 * Requirements:
 *   - DB credentials in .env (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME)
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Category } from './category.entity';

dotenv.config();

const DEFAULT_CATEGORIES: { name: string; nameTh: string }[] = [
  { name: 'Food and Beverage', nameTh: 'อาหารและเครื่องดื่ม' },
  { name: 'Travel and Transport', nameTh: 'การเดินทาง' },
  { name: 'Job and Occupation', nameTh: 'งานและอาชีพ' },
  { name: 'Animals', nameTh: 'สัตว์' },
  { name: 'Time', nameTh: 'เวลา' },
  { name: 'Family and Relations', nameTh: 'ครอบครัวและความสัมพันธ์' },
  { name: 'Home and Furniture', nameTh: 'บ้านและสิ่งของภายในบ้าน' },
  { name: 'Body Parts', nameTh: 'ร่างกาย' },
  { name: 'Common Daily Verbs', nameTh: 'กริยาที่ใช้บ่อยในชีวิตประจำวัน' },
  { name: 'Emotions and Feelings', nameTh: 'อารมณ์และความรู้สึก' },
  { name: 'School and Education', nameTh: 'โรงเรียนและการศึกษา' },
  { name: 'Weather', nameTh: 'สภาพอากาศ' },
  { name: 'Sports and Equipment', nameTh: 'กีฬาและอุปกรณ์กีฬา' },
  { name: 'Vegetables and Fruits', nameTh: 'ผักและผลไม้' },
  {
    name: 'Electrical and Hardware Tools',
    nameTh: 'อุปกรณ์ไฟฟ้าและอุปกรณ์ช่าง',
  },
  { name: 'Technology Devices', nameTh: 'อุปกรณ์เทคโนโลยี' },
];

async function main() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'vocab_app_db',
    entities: [Category],
    synchronize: false,
  });

  await dataSource.initialize();
  const repo = dataSource.getRepository(Category);

  let inserted = 0;
  let skipped = 0;

  for (const cat of DEFAULT_CATEGORIES) {
    const exists = await repo.findOne({ where: { name: cat.name } });
    if (exists) {
      console.log(`⏭  Skipped (already exists): ${cat.name}`);
      skipped++;
      continue;
    }
    await repo.save(repo.create({ name: cat.name, nameTh: cat.nameTh }));
    console.log(`✅  Inserted: ${cat.name} (${cat.nameTh})`);
    inserted++;
  }

  console.log(`\nDone — inserted: ${inserted}, skipped: ${skipped}`);
  await dataSource.destroy();
}

main().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
