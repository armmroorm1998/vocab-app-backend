import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  NotFoundException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ListeningService } from './listening.service';
import {
  CreateListeningLessonDto,
  UpdateListeningLessonDto,
  CreateListeningUnitDto,
  UpdateListeningUnitDto,
} from './listening.dto';
import { AdminGuard } from '../user/admin.guard';

@Controller('listening')
export class ListeningController {
  constructor(private readonly service: ListeningService) {}

  @Get('lessons')
  async getLessons() {
    const data = await this.service.getLessons();
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total: data.length,
      body: data,
    };
  }

  @Post('lessons')
  @UseGuards(AdminGuard)
  async createLesson(@Body() dto: CreateListeningLessonDto) {
    const data = await this.service.createLesson(dto);
    return {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Lesson created',
      total: null,
      body: data,
    };
  }

  @Put('lessons/:id')
  @UseGuards(AdminGuard)
  async updateLesson(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateListeningLessonDto,
  ) {
    const data = await this.service.updateLesson(id, dto);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Lesson updated',
      total: null,
      body: data,
    };
  }

  @Delete('lessons/:id')
  @UseGuards(AdminGuard)
  async deleteLesson(@Param('id', ParseIntPipe) id: number) {
    await this.service.deleteLesson(id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Lesson deleted',
      total: null,
      body: null,
    };
  }

  @Post('units')
  @UseGuards(AdminGuard)
  async createUnit(@Body() dto: CreateListeningUnitDto) {
    const data = await this.service.createUnit(dto);
    return {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Unit created',
      total: null,
      body: data,
    };
  }

  @Put('units/:id')
  @UseGuards(AdminGuard)
  async updateUnit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateListeningUnitDto,
  ) {
    const data = await this.service.updateUnit(id, dto);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Unit updated',
      total: null,
      body: data,
    };
  }

  @Delete('units/:id')
  @UseGuards(AdminGuard)
  async deleteUnit(@Param('id', ParseIntPipe) id: number) {
    await this.service.deleteUnit(id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Unit deleted',
      total: null,
      body: null,
    };
  }

  @Get('lessons/:key/units')
  async getUnitsByLesson(@Param('key') key: string) {
    const data = await this.service.getUnitsByLesson(key);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total: data.length,
      body: data,
    };
  }

  @Get('units/:key')
  async getUnitDetail(@Param('key') key: string) {
    const data = await this.service.getUnitDetail(key);
    if (!data) {
      throw new NotFoundException(`Listening unit not found for key: ${key}`);
    }
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total: null,
      body: data,
    };
  }

  @Get('units/:key/cloze')
  async getUnitCloze(@Param('key') key: string) {
    const data = await this.service.getUnitCloze(key);
    if (!data) {
      throw new NotFoundException(`Listening unit not found for key: ${key}`);
    }
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total: null,
      body: data,
    };
  }
}
