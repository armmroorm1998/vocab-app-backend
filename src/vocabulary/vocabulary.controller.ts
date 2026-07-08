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
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { VocabularyService } from './vocabulary.service';
import { VocabularyProgressService } from './vocabulary-progress.service';
import { VocabularyBookmarkService } from './vocabulary-bookmark.service';
import { VocabularyQuizAttemptService } from './vocabulary-quiz-attempt.service';
import {
  CreateVocabularyDto,
  UpdateVocabularyDto,
  QueryVocabularyDto,
  RandomVocabularyDto,
  FillBlankQueryDto,
  DictationQueryDto,
  ReviewQueryDto,
  RecordReviewDto,
  SubmitQuizAnswerDto,
  WeakWordsQueryDto,
  PaginationQueryDto,
} from './vocabulary.dto';
import { UidAuthGuard } from '../user/uid-auth.guard';
import { CurrentUser } from '../user/current-user.decorator';
import { User } from '../user/user.entity';

@Controller('vocabularies')
export class VocabularyController {
  constructor(
    private readonly service: VocabularyService,
    private readonly progressService: VocabularyProgressService,
    private readonly bookmarkService: VocabularyBookmarkService,
    private readonly quizAttemptService: VocabularyQuizAttemptService,
  ) {}

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

  @Get('fill-blank')
  async findFillBlank(@Query() query: FillBlankQueryDto) {
    const data = await this.service.findFillBlank(query.limit ?? 10);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total: data.length,
      body: data,
    };
  }

  @Get('dictation')
  async findDictation(@Query() query: DictationQueryDto) {
    const data = await this.service.findDictation(query.limit ?? 10);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total: data.length,
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

  @Get('review')
  @UseGuards(UidAuthGuard)
  async findDueForReview(
    @CurrentUser() user: User,
    @Query() query: ReviewQueryDto,
  ) {
    const data = await this.progressService.getDueForReview(
      user.id,
      query.limit ?? 20,
    );
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total: data.length,
      body: data,
    };
  }

  @Get('progress-stats')
  @UseGuards(UidAuthGuard)
  async getProgressStats(@CurrentUser() user: User) {
    const data = await this.progressService.getProgressStats(user.id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total: null,
      body: data,
    };
  }

  @Get('quiz-stats')
  @UseGuards(UidAuthGuard)
  async getQuizStats(@CurrentUser() user: User) {
    const data = await this.quizAttemptService.getStats(user.id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total: null,
      body: data,
    };
  }

  @Get('weak')
  @UseGuards(UidAuthGuard)
  async getWeakWords(
    @CurrentUser() user: User,
    @Query() query: WeakWordsQueryDto,
  ) {
    const data = await this.quizAttemptService.getWeakWords(
      user.id,
      query.limit ?? 5,
    );
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total: data.length,
      body: data,
    };
  }

  @Get('bookmarks')
  @UseGuards(UidAuthGuard)
  async listBookmarks(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { data, total } = await this.bookmarkService.listBookmarks(
      user.id,
      page,
      limit,
    );
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

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.service.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total: null,
      body: data,
    };
  }

  @Post()
  async create(@Body() dto: CreateVocabularyDto) {
    const data = await this.service.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Created',
      total: null,
      body: data,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVocabularyDto,
  ) {
    const data = await this.service.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Updated',
      total: null,
      body: data,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Deleted',
      total: null,
      body: null,
    };
  }

  @Post(':id/review')
  @UseGuards(UidAuthGuard)
  async recordReview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body() dto: RecordReviewDto,
  ) {
    const data = await this.progressService.recordReview(
      user.id,
      id,
      dto.correct,
    );
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total: null,
      body: data,
    };
  }

  @Post(':id/quiz-answer')
  @UseGuards(UidAuthGuard)
  async submitQuizAnswer(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body() dto: SubmitQuizAnswerDto,
  ) {
    const data = await this.quizAttemptService.submitAnswer(
      user.id,
      id,
      dto.selectedAnswer,
    );
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total: null,
      body: data,
    };
  }

  @Post(':id/bookmark')
  @UseGuards(UidAuthGuard)
  async addBookmark(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    await this.bookmarkService.addBookmark(user.id, id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Bookmarked',
      total: null,
      body: null,
    };
  }

  @Delete(':id/bookmark')
  @UseGuards(UidAuthGuard)
  async removeBookmark(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    await this.bookmarkService.removeBookmark(user.id, id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Bookmark removed',
      total: null,
      body: null,
    };
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
    if (!file)
      throw new BadRequestException('CSV file is required (field name: file)');
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
