import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
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

  @Column({ type: 'text', nullable: true })
  example: string | null;

  @Column({ name: 'pronunciation_thai', length: 255, nullable: true })
  pronunciationThai: string | null;

  @Column({ name: 'ipa', length: 255, nullable: true })
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
