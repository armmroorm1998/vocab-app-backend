import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Vocabulary } from './vocabulary.entity';

@Entity('vocabulary_progress')
@Unique(['user', 'vocabulary'])
export class VocabularyProgress {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Vocabulary, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vocabulary_id' })
  vocabulary: Vocabulary;

  @Column({ name: 'times_seen', type: 'int', default: 0 })
  timesSeen: number;

  @Column({ name: 'times_correct', type: 'int', default: 0 })
  timesCorrect: number;

  @Column({ name: 'times_wrong', type: 'int', default: 0 })
  timesWrong: number;

  @Column({ name: 'ease_factor', type: 'float', default: 2.5 })
  easeFactor: number;

  @Column({ name: 'interval_days', type: 'int', default: 0 })
  intervalDays: number;

  @Column({ type: 'int', default: 0 })
  repetitions: number;

  @Column({
    name: 'next_review_date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  nextReviewDate: Date;

  @Column({ name: 'last_reviewed_date', type: 'timestamp', nullable: true })
  lastReviewedDate: Date | null;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_date' })
  updatedDate: Date;
}
