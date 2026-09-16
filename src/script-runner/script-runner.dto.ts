import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export const RUNNABLE_SCRIPTS = [
  'seed:categories',
  'auto-categorize',
  'auto-level',
  'vocab:stats',
  'vocab:generate',
  'fill:examples',
  'conversation:seed',
  'conversation:generate',
  'listening:seed',
  'listening:seed:lesson2',
] as const;

export type RunnableScript = (typeof RUNNABLE_SCRIPTS)[number];

export class RunScriptDto {
  @IsString()
  @IsIn(RUNNABLE_SCRIPTS)
  script: RunnableScript;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  count?: number;
}
