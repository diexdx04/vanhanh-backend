import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EventsModule } from 'src/socket/events.module';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  imports: [PrismaModule, EventsModule],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
