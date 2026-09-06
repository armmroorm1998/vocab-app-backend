import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AdminUsersQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

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

export class UpdateUserAccessDto {
  // null clears access — the ValidateIf lets that through while still
  // requiring a real ISO date string otherwise.
  @ValidateIf((o: UpdateUserAccessDto) => o.freeAccessUntil !== null)
  @IsISO8601()
  freeAccessUntil: string | null;
}
