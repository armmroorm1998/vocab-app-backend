import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { AdminGuard } from '../user/admin.guard';

@Controller('categories')
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  @Get()
  async findAll() {
    const data = await this.service.findAll();
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
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total: null,
      body: data,
    };
  }

  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() dto: CreateCategoryDto) {
    const data = await this.service.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Category created',
      total: null,
      body: data,
    };
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    const data = await this.service.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Category updated',
      total: null,
      body: data,
    };
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Category deleted',
      total: null,
      body: null,
    };
  }
}
