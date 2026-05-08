import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { parse } from 'csv-parse/sync';
import { VerbForm } from './verb-form.entity';

const REQUIRED_COLUMNS = ['word', 'meaning', 'v2', 'v3'] as const;

@Injectable()
export class VerbFormService {
  constructor(
    @InjectRepository(VerbForm)
    private readonly repo: Repository<VerbForm>,
  ) {}

  async findRandom(limit: number): Promise<VerbForm[]> {
    // Clamp limit to prevent excessive DB load
    const safeLimit = Math.min(Math.max(1, limit), 50);
    return this.repo
      .createQueryBuilder('vf')
      .orderBy('RANDOM()')
      .limit(safeLimit)
      .getMany();
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  async importFromCsv(
    buffer: Buffer,
  ): Promise<{ inserted: number; skipped: number; errors: string[] }> {
    let rows: Record<string, string>[];
    try {
      rows = parse(buffer, {
        columns: true, // first row = header
        skip_empty_lines: true,
        trim: true,
      });
    } catch {
      throw new BadRequestException('Invalid CSV format');
    }

    if (rows.length === 0) {
      throw new BadRequestException('CSV file is empty');
    }

    // Validate headers
    const headers = Object.keys(rows[0]);
    const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
    if (missing.length > 0) {
      throw new BadRequestException(
        `CSV is missing required columns: ${missing.join(', ')}`,
      );
    }

    const entities: VerbForm[] = [];
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const lineNum = i + 2; // +2 because row 1 is the header

      const word = row['word']?.trim();
      const meaning = row['meaning']?.trim();
      const v2 = row['v2']?.trim();
      const v3 = row['v3']?.trim();

      if (!word || !meaning || !v2 || !v3) {
        errors.push(`Row ${lineNum}: missing required value(s)`);
        continue;
      }

      // Sanitize: reject values that exceed maximum length
      if ([word, meaning, v2, v3].some((v) => v.length > 500)) {
        errors.push(`Row ${lineNum}: value exceeds maximum length`);
        continue;
      }

      entities.push(this.repo.create({ word, meaning, v2, v3 }));
    }

    if (entities.length === 0) {
      return { inserted: 0, skipped: rows.length, errors };
    }

    // Insert and skip rows where word already exists
    await this.repo
      .createQueryBuilder()
      .insert()
      .into(VerbForm)
      .values(entities)
      .orIgnore()
      .execute();

    return {
      inserted: entities.length,
      skipped: rows.length - entities.length,
      errors,
    };
  }
}
