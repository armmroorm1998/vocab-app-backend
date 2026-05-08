import { Controller, Get, Query, HttpStatus } from '@nestjs/common';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { VerbFormService } from './verb-form.service';

class RandomVerbFormQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

@Controller('verb-forms')
export class VerbFormController {
  constructor(private readonly service: VerbFormService) {}

  @Get('random')
  async findRandom(@Query() query: RandomVerbFormQueryDto) {
    const [data, seededTotal] = await Promise.all([
      this.service.findRandom(query.limit ?? 10),
      this.service.count(),
    ]);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total: data.length,
      seededTotal,
      body: data,
    };
  }
}
