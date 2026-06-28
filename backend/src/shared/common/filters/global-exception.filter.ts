import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let errors: string[] = [];

    if (exception instanceof HttpException) {
      const res = exception.getResponse() as string | Record<string, unknown>;
      if (status === 400) {
        console.warn('--- 400 Bad Request Exception ---');
        console.warn('Response:', JSON.stringify(res, null, 2));
        console.warn('---------------------------------');
      }
      if (typeof res === 'string') {
        message = res;
        errors = [res];
      } else if (res && typeof res === 'object') {
        const resMessage = res.message;
        if (Array.isArray(resMessage)) {
          errors = resMessage.map(String);
          message = 'Validation failed';
        } else if (typeof resMessage === 'string') {
          errors = [resMessage];
          message = resMessage;
        } else {
          message = exception.message;
          errors = [message];
        }
      }
    } else {
      const err = exception as Error;
      message = err?.message || 'An unexpected error occurred';
      errors = [message];
      console.error('Unhandled Exception:', exception);
    }

    response.status(status).json({
      success: false,
      message,
      errors,
    });
  }
}
