import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [TokenService],
  imports: [
    ConfigModule.forRoot(), // Tải các biến môi trường từ tệp .env

    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      global: true,
      signOptions: { expiresIn: '30m' },
    }),
  ],
  exports: [TokenService],
})
export class TokenModule {}
