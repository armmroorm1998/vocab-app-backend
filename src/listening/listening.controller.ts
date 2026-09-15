import { Controller, Get, Param, NotFoundException, HttpStatus } from '@nestjs/common';
import { ListeningService } from './listening.service';

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
