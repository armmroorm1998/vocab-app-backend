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

@Entity('listening_lessons')
export class ListeningLesson {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'key', type: 'varchar', length: 100, unique: true })
  key: string;

  @Column({ name: 'title', type: 'varchar', length: 160 })
  title: string;

  @Column({ name: 'emoji', type: 'varchar', length: 8, nullable: true })
  emoji: string | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @OneToMany(() => ListeningUnit, (u) => u.lesson, { cascade: false })
  units: ListeningUnit[];

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_date' })
  updatedDate: Date;
}

@Entity('listening_units')
export class ListeningUnit {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => ListeningLesson, (l) => l.units, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lesson_id' })
  lesson: ListeningLesson;

  @Column({ name: 'key', type: 'varchar', length: 100, unique: true })
  key: string;

  @Column({ name: 'title', type: 'varchar', length: 160 })
  title: string;

  @Column({ name: 'emoji', type: 'varchar', length: 8, nullable: true })
  emoji: string | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @Column({ name: 'video_id', type: 'varchar', length: 32 })
  videoId: string;

  @Column({ name: 'start_seconds', type: 'int' })
  startSeconds: number;

  @Column({ name: 'end_seconds', type: 'int' })
  endSeconds: number;

  @OneToMany(() => ListeningLine, (l) => l.unit, { cascade: false })
  lines: ListeningLine[];

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_date' })
  updatedDate: Date;
}

@Entity('listening_lines')
export class ListeningLine {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => ListeningUnit, (u) => u.lines, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'unit_id' })
  unit: ListeningUnit;

  @Column({ name: 'order_index', type: 'int', default: 0 })
  orderIndex: number;

  @Column({ name: 'speaker', type: 'varchar', length: 100 })
  speaker: string;

  @Column({ name: 'text_en', type: 'text' })
  textEn: string;

  @Column({ name: 'text_th', type: 'text', nullable: true })
  textTh: string | null;
}
