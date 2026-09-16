import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DialogueLineDto {
  @IsString()
  @MinLength(1)
  speaker: string;

  @IsString()
  @MinLength(1)
  text: string;
}

export class CreateConversationCategoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  key: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  emoji?: string;

  @IsOptional()
  @IsInt()
  displayOrder?: number;
}

export class UpdateConversationCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  emoji?: string;

  @IsOptional()
  @IsInt()
  displayOrder?: number;
}

export class CreateConversationQuestionDto {
  @IsInt()
  categoryId: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  speaker?: string;

  @IsString()
  @MinLength(1)
  prompt: string;

  @IsArray()
  @IsString({ each: true })
  choices: string[];

  @IsString()
  @MinLength(1)
  correctAnswer: string;

  @IsString()
  @MinLength(1)
  naturalAnswer: string;

  @IsOptional()
  @IsObject()
  choiceScores?: Record<string, number>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DialogueLineDto)
  dialogueLines?: DialogueLineDto[];

  @IsOptional()
  @IsInt()
  orderIndex?: number;
}

export class UpdateConversationQuestionDto {
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  speaker?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  prompt?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  choices?: string[];

  @IsOptional()
  @IsString()
  @MinLength(1)
  correctAnswer?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  naturalAnswer?: string;

  @IsOptional()
  @IsObject()
  choiceScores?: Record<string, number>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DialogueLineDto)
  dialogueLines?: DialogueLineDto[];

  @IsOptional()
  @IsInt()
  orderIndex?: number;
}

export class ConversationQuizQueryDto {
  @IsOptional()
  @IsString()
  categoryKey?: string;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  limit?: number;
}

export class SubmitAnswerDto {
  @IsString()
  selectedChoice: string;
}

export class HistoryQueryDto {
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
