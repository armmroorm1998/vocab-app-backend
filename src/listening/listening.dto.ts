import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ListeningLineDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  speaker: string;

  @IsString()
  @MinLength(1)
  textEn: string;

  @IsOptional()
  @IsString()
  textTh?: string;
}

export class CreateListeningLessonDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  key: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  emoji?: string;

  @IsOptional()
  @IsInt()
  displayOrder?: number;
}

export class UpdateListeningLessonDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  emoji?: string;

  @IsOptional()
  @IsInt()
  displayOrder?: number;
}

export class CreateListeningUnitDto {
  @IsInt()
  lessonId: number;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  key: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  emoji?: string;

  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  videoId: string;

  @IsInt()
  startSeconds: number;

  @IsInt()
  endSeconds: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ListeningLineDto)
  lines?: ListeningLineDto[];
}

export class UpdateListeningUnitDto {
  @IsOptional()
  @IsInt()
  lessonId?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  emoji?: string;

  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  videoId?: string;

  @IsOptional()
  @IsInt()
  startSeconds?: number;

  @IsOptional()
  @IsInt()
  endSeconds?: number;

  // When provided, replaces all of the unit's lines wholesale — matches how
  // the seed scripts mirror a source transcript 1:1 on re-run.
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ListeningLineDto)
  lines?: ListeningLineDto[];
}
