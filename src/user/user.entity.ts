import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  uid: string; // UID from browser

  @Column()
  recoverKeyHash: string; // Hashed recover key

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ nullable: true })
  displayName?: string;

  @Column({ name: 'contributed_words_count', type: 'int', default: 0 })
  contributedWordsCount: number;

  @Column({ name: 'free_access_until', type: 'timestamp', nullable: true })
  freeAccessUntil: Date | null;

  // Longest goal-met-day streak already rewarded with a free-access bonus —
  // prevents re-granting the same milestone and resets when the streak breaks.
  @Column({ name: 'rewarded_goal_streak', type: 'int', default: 0 })
  rewardedGoalStreak: number;
}
