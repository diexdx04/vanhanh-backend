import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt.guard';
import { HttpExceptionFilter } from './http-exception.filter';
import { PostModule } from './post/post.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { EmailService } from './email/email.service';
import { EmailModule } from './email/email.module';
import { VerificationModule } from './verification/verification.module';
import { LikeModule } from './like/like.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, PostModule, EmailModule, VerificationModule, LikeModule],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaModule,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    EmailService,
  ],
})
export class AppModule {}
