import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActivityLog } from './user-activity-log.entity';

export const DAILY_GOAL = 10;

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  todayCount: number;
  dailyGoal: number;
  goalMet: boolean;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, delta: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

@Injectable()
export class UserActivityService {
  constructor(
    @InjectRepository(UserActivityLog)
    private readonly repo: Repository<UserActivityLog>,
  ) {}

  async recordActivity(userId: string): Promise<void> {
    const date = todayStr();
    const existing = await this.repo.findOne({
      where: { user: { id: userId }, activityDate: date },
    });

    if (existing) {
      existing.count += 1;
      await this.repo.save(existing);
      return;
    }

    const row = this.repo.create({
      user: { id: userId } as UserActivityLog['user'],
      activityDate: date,
      count: 1,
    });
    await this.repo.save(row);
  }

  async getStreak(userId: string): Promise<StreakInfo> {
    const rows = await this.repo.find({
      where: { user: { id: userId } },
      order: { activityDate: 'DESC' },
    });

    const today = todayStr();
    const dateSet = new Set(rows.map((r) => r.activityDate));
    const todayCount = rows.find((r) => r.activityDate === today)?.count ?? 0;

    let currentStreak = 0;
    let cursor = dateSet.has(today) ? today : addDays(today, -1);
    while (dateSet.has(cursor)) {
      currentStreak++;
      cursor = addDays(cursor, -1);
    }

    const sortedAsc = [...dateSet].sort();
    let longestStreak = 0;
    let run = 0;
    let prev: string | null = null;
    for (const d of sortedAsc) {
      run = prev && addDays(prev, 1) === d ? run + 1 : 1;
      longestStreak = Math.max(longestStreak, run);
      prev = d;
    }

    return {
      currentStreak,
      longestStreak,
      todayCount,
      dailyGoal: DAILY_GOAL,
      goalMet: todayCount >= DAILY_GOAL,
    };
  }
}
