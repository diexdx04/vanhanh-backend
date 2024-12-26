import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { HttpExceptionFilter } from './http-exception.filter';
import { TransformInterceptor } from './interceptor.ts/transform.interceptor';
import { LoggingInterceptor } from './interceptor.ts/logging.interceptor';
import { TimeoutInterceptor } from './interceptor.ts/timeout.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TimeoutInterceptor());

  dotenv.config();

  // middleware cors
  const allowedOrigins = ['http://localhost:3001'];
  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  });

  //validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
