import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_activity_logs')
@Unique(['user', 'activityDate'])
export class UserActivityLog {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'activity_date', type: 'date' })
  activityDate: string;

  @Column({ type: 'int', default: 0 })
  count: number;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;
}
