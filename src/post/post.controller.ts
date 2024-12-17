import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { PostService } from './post.service';
import { PostDto } from './valid/post.dto';
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('')
  async createPost(@Body() body: PostDto, @Request() req) {
    return this.postService.createPost(body, req.user);
  }

  @Get('')
  async getPosts(@Request() req) {
    const userId = req.user.userId;
    return this.postService.getPosts(userId);
  }

  @Get(':id/likes')
  async getPostLikes(@Param('id') postId: number) {
    return this.postService.getPostLikes(postId);
  }
}
