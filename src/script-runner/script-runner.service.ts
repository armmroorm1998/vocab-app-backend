import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { spawn } from 'child_process';
import { RunScriptDto, RUNNABLE_SCRIPTS } from './script-runner.dto';

type RunScriptResult = {
  script: string;
  command: string[];
  exitCode: number;
  stdout: string;
  stderr: string;
};

@Injectable()
export class ScriptRunnerService {
  getAvailableScripts() {
    return RUNNABLE_SCRIPTS;
  }

  async runScript(dto: RunScriptDto): Promise<RunScriptResult> {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException(
        'Script runner API is disabled in production',
      );
    }

    const extraArgs = this.buildScriptArgs(dto);
    const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const command = [
      'run',
      dto.script,
      ...(extraArgs.length ? ['--', ...extraArgs] : []),
    ];

    return new Promise((resolve, reject) => {
      const child = spawn(npmCommand, command, {
        cwd: process.cwd(),
        env: process.env,
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (chunk: Buffer | string) => {
        stdout += chunk.toString();
      });

      child.stderr.on('data', (chunk: Buffer | string) => {
        stderr += chunk.toString();
      });

      child.on('error', (error) => {
        reject(error);
      });

      child.on('close', (exitCode) => {
        const result: RunScriptResult = {
          script: dto.script,
          command: [npmCommand, ...command],
          exitCode: exitCode ?? 1,
          stdout,
          stderr,
        };

        if ((exitCode ?? 1) !== 0) {
          reject(
            new BadRequestException({
              message: `Script failed: ${dto.script}`,
              ...result,
            }),
          );
          return;
        }

        resolve(result);
      });
    });
  }

  private buildScriptArgs(dto: RunScriptDto): string[] {
    switch (dto.script) {
      case 'conversation:generate': {
        const args: string[] = [];
        if (dto.category) args.push(`--category=${dto.category}`);
        if (typeof dto.count === 'number') args.push(`--count=${dto.count}`);
        return args;
      }
      case 'conversation:reset':
        return dto.category ? [`--category=${dto.category}`] : [];
      default:
        return [];
    }
  }
}
