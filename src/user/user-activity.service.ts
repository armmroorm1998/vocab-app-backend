import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActivityLog } from './user-activity-log.entity';
import { UserService } from './user.service';

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
    private readonly userService: UserService,
  ) {}

  async recordActivity(userId: string): Promise<void> {
    const date = todayStr();
    const existing = await this.repo.findOne({
      where: { user: { id: userId }, activityDate: date },
    });

    let todayCount: number;
    if (existing) {
      existing.count += 1;
      await this.repo.save(existing);
      todayCount = existing.count;
    } else {
      const row = this.repo.create({
        user: { id: userId } as UserActivityLog['user'],
        activityDate: date,
        count: 1,
      });
      await this.repo.save(row);
      todayCount = row.count;
    }

    // Check the streak bonus right when today's count crosses the goal —
    // this fires exactly once per user per day.
    if (todayCount === DAILY_GOAL) {
      const streak = await this.computeGoalMetStreak(userId);
      await this.userService.recordGoalStreakProgress(userId, streak);
    }
  }

  private async computeGoalMetStreak(userId: string): Promise<number> {
    const rows = await this.repo.find({
      where: { user: { id: userId } },
    });
    const countByDate = new Map(rows.map((r) => [r.activityDate, r.count]));

    let streak = 0;
    let cursor = todayStr();
    while ((countByDate.get(cursor) ?? 0) >= DAILY_GOAL) {
      streak++;
      cursor = addDays(cursor, -1);
    }
    return streak;
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
