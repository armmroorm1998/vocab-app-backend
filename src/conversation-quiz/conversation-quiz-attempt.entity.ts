import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { ConversationQuizQuestion } from './conversation-quiz.entity';

@Entity('conversation_quiz_attempts')
export class ConversationQuizAttempt {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ConversationQuizQuestion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: ConversationQuizQuestion;

  @Column({ name: 'selected_choice', type: 'text' })
  selectedChoice: string;

  @Column({ type: 'int' })
  score: number;

  @Column({ name: 'is_correct', type: 'boolean' })
  isCorrect: boolean;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;
}
