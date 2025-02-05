import { Module } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { EmailModule } from 'src/email/email.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventsModule } from 'src/socket/events.module';
import { TokenModule } from 'src/token/token.module';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';

@Module({
  providers: [VerificationService, PrismaService, AuthService],
  controllers: [VerificationController],
  imports: [TokenModule, EmailModule, EventsModule],
})
export class VerificationModule {}
