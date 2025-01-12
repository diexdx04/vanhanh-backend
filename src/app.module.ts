import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt.guard';
import { EmailModule } from './email/email.module';
import { EmailService } from './email/email.service';
import { HttpExceptionFilter } from './http-exception.filter';
import { PostModule } from './post/post.module';
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './socket/events.module';
import { UserModule } from './user/user.module';
import { VerificationModule } from './verification/verification.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    PostModule,
    EmailModule,
    VerificationModule,
    EventsModule,
  ],
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
