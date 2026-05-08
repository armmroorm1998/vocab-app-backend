import {
  Controller,
  Get,
  Post,
  Query,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
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

const CSV_UPLOAD_OPTIONS = {
  storage: memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    // Validate MIME type and extension to prevent malicious uploads
    const isCsv =
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.toLowerCase().endsWith('.csv');
    if (!isCsv) {
      return cb(new BadRequestException('Only .csv files are allowed'), false);
    }
    cb(null, true);
  },
};

@Controller('verb-forms')
export class VerbFormController {
  constructor(private readonly service: VerbFormService) {}

  @Post('import-csv')
  @UseInterceptors(FileInterceptor('file', CSV_UPLOAD_OPTIONS))
  async importCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(
        'No file uploaded. Field name must be "file"',
      );
    }

    const result: { inserted: number; skipped: number; errors: string[] } =
      await this.service.importFromCsv(file.buffer);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: `Imported ${result.inserted} row(s), skipped ${result.skipped} row(s)`,
      total: result.inserted,
      body: {
        inserted: result.inserted,
        skipped: result.skipped,
        errors: result.errors,
      },
    };
  }

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
