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

export enum EPartOfSpeech {
  NOUN = 'noun',
  VERB = 'verb',
  ADJECTIVE = 'adjective',
  ADVERB = 'adverb',
  PREPOSITION = 'preposition',
  CONJUNCTION = 'conjunction',
  PRONOUN = 'pronoun',
  PHRASE = 'phrase',
  OTHER = 'other',
}

@Entity('vocabularies')
export class Vocabulary {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ length: 255 })
  word: string;

  @Column({ type: 'text' })
  meaning: string;

  @OneToMany(() => VocabularyExample, (ex) => ex.vocabulary, { cascade: true })
  examples: VocabularyExample[];

  @Column({
    name: 'pronunciation_thai',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  pronunciationThai: string | null;

  @Column({ name: 'ipa', type: 'varchar', length: 255, nullable: true })
  ipa: string | null;

  @Column({
    name: 'part_of_speech',
    type: 'enum',
    enum: EPartOfSpeech,
    default: EPartOfSpeech.OTHER,
  })
  partOfSpeech: EPartOfSpeech;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_date' })
  updatedDate: Date;
}

@Entity('vocabulary_examples')
export class VocabularyExample {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'text' })
  sentence: string;

  @ManyToOne(() => Vocabulary, (v) => v.examples, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vocabulary_id' })
  vocabulary: Vocabulary;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;
}
