import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Never leak stack traces or internal paths to client
    const message =
      exception instanceof HttpException
        ? (() => {
            const res = exception.getResponse();
            if (typeof res === 'string') return res;
            if (typeof res === 'object' && res !== null && 'message' in res) {
              return (res as { message: string | string[] }).message;
            }
            return exception.message;
          })()
        : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      success: false,
      message,
      total: null,
      body: null,
    });
  }
}
