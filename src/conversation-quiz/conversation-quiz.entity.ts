import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export interface ConversationQuizDialogueLine {
  speaker: string;
  text: string;
}

@Entity('conversation_quiz_categories')
export class ConversationQuizCategory {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'key', type: 'varchar', length: 100, unique: true })
  key: string;

  @Column({ name: 'name', type: 'varchar', length: 120 })
  name: string;

  @Column({ name: 'emoji', type: 'varchar', length: 8, nullable: true })
  emoji: string | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @OneToMany(() => ConversationQuizQuestion, (q) => q.category, {
    cascade: false,
  })
  questions: ConversationQuizQuestion[];

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_date' })
  updatedDate: Date;
}

@Entity('conversation_quiz_questions')
export class ConversationQuizQuestion {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => ConversationQuizCategory, (c) => c.questions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: ConversationQuizCategory;

  @Column({
    name: 'speaker',
    type: 'varchar',
    length: 100,
    default: 'Interviewer',
  })
  speaker: string;

  @Column({ name: 'prompt', type: 'text' })
  prompt: string;

  @Column({ name: 'choices', type: 'jsonb' })
  choices: string[];

  @Column({ name: 'correct_answer', type: 'text' })
  correctAnswer: string;

  @Column({ name: 'natural_answer', type: 'text' })
  naturalAnswer: string;

  @Column({ name: 'dialogue_lines', type: 'jsonb', nullable: true })
  dialogueLines: ConversationQuizDialogueLine[] | null;

  @Column({ name: 'choice_scores', type: 'jsonb', nullable: true })
  choiceScores: Record<string, number> | null;

  @Column({ name: 'order_index', type: 'int', default: 0 })
  orderIndex: number;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_date' })
  updatedDate: Date;
}
