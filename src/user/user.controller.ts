import {
  Controller,
  Post,
  Get,
  Body,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserActivityService } from './user-activity.service';
import { UidAuthGuard } from './uid-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { User } from './user.entity';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userActivityService: UserActivityService,
  ) {}

  @Post('register')
  async register(@Body() body: { displayName?: string }) {
    return this.userService.registerUser(body.displayName);
  }

  @Post('recover')
  async recover(@Body() body: { recoveryKey: string }) {
    return this.userService.recoverByRecoveryKey(body.recoveryKey);
  }

  @Get('me')
  @UseGuards(UidAuthGuard)
  me(@CurrentUser() user: User) {
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total: null,
      body: {
        id: user.id,
        uid: user.uid,
        displayName: user.displayName,
        createdAt: user.createdAt,
        contributedWordsCount: user.contributedWordsCount,
        freeAccessUntil: user.freeAccessUntil,
        isAdmin: user.isAdmin,
      },
    };
  }

  @Get('streak')
  @UseGuards(UidAuthGuard)
  async streak(@CurrentUser() user: User) {
    const data = await this.userActivityService.getStreak(user.id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total: null,
      body: data,
    };
  }
}
