import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { VocabularyService } from './vocabulary.service';
import {
  CreateVocabularyDto,
  UpdateVocabularyDto,
  QueryVocabularyDto,
  RandomVocabularyDto,
} from './vocabulary.dto';

@Controller('vocabularies')
export class VocabularyController {
  constructor(private readonly service: VocabularyService) {}

  @Get()
  async findAll(@Query() query: QueryVocabularyDto) {
    const { data, total, page, limit } = await this.service.findAll(query);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total,
      page,
      limit,
      body: data,
    };
  }

  @Get('random')
  async findRandom(@Query() query: RandomVocabularyDto) {
    const data = await this.service.findRandom(query);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total: data.length,
      body: data,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.service.findOne(id);
    return { statusCode: HttpStatus.OK, success: true, message: '', total: null, body: data };
  }

  @Post()
  async create(@Body() dto: CreateVocabularyDto) {
    const data = await this.service.create(dto);
    return { statusCode: HttpStatus.CREATED, success: true, message: 'Created', total: null, body: data };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVocabularyDto,
  ) {
    const data = await this.service.update(id, dto);
    return { statusCode: HttpStatus.OK, success: true, message: 'Updated', total: null, body: data };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { statusCode: HttpStatus.OK, success: true, message: 'Deleted', total: null, body: null };
  }

  @Post('import/csv')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
      fileFilter: (_req, file, cb) => {
        // Validate file type to prevent malicious uploads
        const isCSV =
          file.mimetype === 'text/csv' ||
          file.mimetype === 'application/vnd.ms-excel' ||
          file.mimetype === 'text/plain' ||
          file.originalname.toLowerCase().endsWith('.csv');
        if (isCSV) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only .csv files are accepted'), false);
        }
      },
    }),
  )
  async importCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('CSV file is required (field name: file)');
    const result = await this.service.importCsv(file.buffer);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: `Imported ${result.imported} vocabularies`,
      total: result.imported,
      body: { errors: result.errors },
    };
  }
}
