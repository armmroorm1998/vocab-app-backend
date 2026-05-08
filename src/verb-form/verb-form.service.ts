import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerbForm } from './verb-form.entity';

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
}
