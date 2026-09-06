import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RunScriptDto } from './script-runner.dto';
import { ScriptRunnerService } from './script-runner.service';
import { AdminGuard } from '../user/admin.guard';

@Controller('scripts')
@UseGuards(AdminGuard)
export class ScriptRunnerController {
  constructor(private readonly service: ScriptRunnerService) {}

  @Get()
  getAvailableScripts() {
    const data = this.service.getAvailableScripts();
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: '',
      total: data.length,
      body: data,
    };
  }

  @Post('run')
  async runScript(@Body() dto: RunScriptDto) {
    const data = await this.service.runScript(dto);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: `Script completed: ${dto.script}`,
      total: null,
      body: data,
    };
  }
}
