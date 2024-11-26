import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, PostModule],
  controllers: [AppController],
  providers: [AppService, PrismaModule],
})
export class AppModule {}
