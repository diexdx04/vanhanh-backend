import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { LikeController } from './like.controller';

@Module({
  providers: [LikeService, PrismaService],
  controllers: [LikeController],
  exports: [LikeService],
})
export class LikeModule {}
