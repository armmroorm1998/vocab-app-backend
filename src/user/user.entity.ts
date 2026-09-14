import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  uid: string; // UID from browser

  @Column()
  recoverKeyHash: string; // Hashed recover key

  // Deterministic (non-secret-strength) hash of the recovery key used purely as
  // an indexed lookup so /user/recover can find the candidate row directly
  // instead of bcrypt-comparing against every user. recoverKeyHash above
  // remains the actual credential check. Nullable/non-unique because legacy
  // rows created before this column existed have no way to backfill it until
  // the user next recovers successfully (see UserService.recoverByRecoveryKey).
  @Index()
  @Column({ name: 'recover_key_lookup', type: 'varchar', nullable: true })
  recoverKeyLookup?: string | null;

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

  @Column({ name: 'is_admin', type: 'boolean', default: false })
  isAdmin: boolean;
}
