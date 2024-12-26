import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { PostService } from './post.service';
import { PostDto } from './post.dto';
import { EventsGateway } from 'src/socket/events.gateway';
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @Post('')
  async createPost(@Body() body: PostDto, @Request() req) {
    const newPost = await this.postService.createPost(body, req.user);
    // this.eventsGateway.server.emit('newPost', newPost);
    this.eventsGateway.handleNewPost(newPost);

    return newPost;
  }

  @Get('')
  async getPosts(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 3,
  ) {
    const userId = req.user.userId;
    return this.postService.getPosts(userId, page, limit);
  }

  @Get(':id/likes')
  async getPostLikes(@Param('id') postId: number) {
    return this.postService.getPostLikes(postId);
  }
}
