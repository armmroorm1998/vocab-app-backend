import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerbForm } from './verb-form.entity';
import { VerbFormService } from './verb-form.service';
import { VerbFormController } from './verb-form.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VerbForm])],
  providers: [VerbFormService],
  controllers: [VerbFormController],
})
export class VerbFormModule {}
