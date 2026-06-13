import { Module } from '@nestjs/common';
import { ScriptRunnerController } from './script-runner.controller';
import { ScriptRunnerService } from './script-runner.service';

@Module({
  controllers: [ScriptRunnerController],
  providers: [ScriptRunnerService],
})
export class ScriptRunnerModule {}