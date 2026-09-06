import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminUsersQueryDto, UpdateUserAccessDto } from './admin.dto';
import { AdminGuard } from '../user/admin.guard';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('users')
  async listUsers(@Query() query: AdminUsersQueryDto) {
    const { data, total, page, limit } = await this.service.listUsers(query);
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

  @Put('users/:id/access')
  async updateAccess(
    @Param('id') id: string,
    @Body() dto: UpdateUserAccessDto,
  ) {
    const data = await this.service.updateUserAccess(id, dto);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Updated',
      total: null,
      body: data,
    };
  }
}
