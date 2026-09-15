import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListeningController } from './listening.controller';
import { ListeningService } from './listening.service';
import { ListeningLesson, ListeningLine, ListeningUnit } from './listening.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ListeningLesson, ListeningUnit, ListeningLine]),
  ],
  controllers: [ListeningController],
  providers: [ListeningService],
})
export class ListeningModule {}
