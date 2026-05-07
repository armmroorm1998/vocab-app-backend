import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsArray,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EPartOfSpeech } from './vocabulary.entity';

export class CreateVocabularyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  word: string;

  @IsString()
  @MinLength(1)
  meaning: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(2000, { each: true })
  examples?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(255)
  pronunciationThai?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  ipa?: string;

  @IsOptional()
  @IsEnum(EPartOfSpeech)
  partOfSpeech?: EPartOfSpeech;
}

export class UpdateVocabularyDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  word?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  meaning?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(2000, { each: true })
  examples?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(255)
  pronunciationThai?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  ipa?: string;

  @IsOptional()
  @IsEnum(EPartOfSpeech)
  partOfSpeech?: EPartOfSpeech;
}

export class QueryVocabularyDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(EPartOfSpeech)
  partOfSpeech?: EPartOfSpeech;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class RandomVocabularyDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsEnum(EPartOfSpeech)
  partOfSpeech?: EPartOfSpeech;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  excludeIds?: number[];
}
