import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('verb_forms')
export class VerbForm {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ length: 255 })
  word!: string;

  @Column({ type: 'text' })
  meaning!: string;

  @Column({ name: 'v2', length: 255 })
  v2!: string;

  @Column({ name: 'v3', length: 255 })
  v3!: string;

  /** 'regular' | 'irregular' */
  @Column({ name: 'verb_type', type: 'varchar', length: 50 })
  verbType!: string;

  @CreateDateColumn({ name: 'created_date' })
  createdDate!: Date;

  @UpdateDateColumn({ name: 'updated_date' })
  updatedDate!: Date;
}
