import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { EmailModule } from 'src/email/email.module';

@Module({
  providers: [UserService],
  controllers: [UserController],
  imports: [PrismaModule, EmailModule],
})
export class UserModule {}
