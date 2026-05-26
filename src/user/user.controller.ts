import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() body: { displayName?: string }) {
    return this.userService.registerUser(body.displayName);
  }

  @Post('recover')
  async recover(@Body() body: { recoveryKey: string }) {
    return this.userService.recoverByRecoveryKey(body.recoveryKey);
  }
}
