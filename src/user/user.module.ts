import { Module } from '@nestjs/common';
import { EmailModule } from 'src/email/email.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TokenModule } from 'src/token/token.module';
import { VerificationModule } from 'src/verification/verification.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  providers: [UserService],
  controllers: [UserController],
  imports: [PrismaModule, EmailModule, TokenModule, VerificationModule],
})
export class UserModule {}
