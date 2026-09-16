import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListeningController } from './listening.controller';
import { ListeningService } from './listening.service';
import {
  ListeningLesson,
  ListeningLine,
  ListeningUnit,
} from './listening.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ListeningLesson, ListeningUnit, ListeningLine]),
    UserModule,
  ],
  controllers: [ListeningController],
  providers: [ListeningService],
})
export class ListeningModule {}
