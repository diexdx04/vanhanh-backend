import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EventsModule } from 'src/socket/events.module';

@Module({
  imports: [PrismaModule, EventsModule],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
