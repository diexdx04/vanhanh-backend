import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ErrorMessage } from './error/message';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // const message =
    //   exception instanceof HttpException
    //     ? exception.getResponse()
    //     : HttpStatus.INTERNAL_SERVER_ERROR;

    console.log(exception['message'], 2222222222);

    response.status(status).json({
      statusCode: status,
      message: exception['message'],
      userMessage: ErrorMessage[exception['message']],
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
