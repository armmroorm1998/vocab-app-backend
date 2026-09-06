import { Module } from '@nestjs/common';
import { ScriptRunnerController } from './script-runner.controller';
import { ScriptRunnerService } from './script-runner.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [ScriptRunnerController],
  providers: [ScriptRunnerService],
})
export class ScriptRunnerModule {}
