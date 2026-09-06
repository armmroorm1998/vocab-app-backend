import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserActivityLog } from './user-activity-log.entity';
import { UserService } from './user.service';
import { UserActivityService } from './user-activity.service';
import { UidAuthGuard } from './uid-auth.guard';
import { AdminGuard } from './admin.guard';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserActivityLog])],
  providers: [UserService, UserActivityService, UidAuthGuard, AdminGuard],
  controllers: [UserController],
  exports: [UserService, UserActivityService, UidAuthGuard, AdminGuard],
})
export class UserModule {}
