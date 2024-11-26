import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './valid/post.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createPost(@Body() createPostDto: CreatePostDto, @Request() req) {
    console.log(11111111, req);
    return this.postService.createPost(createPostDto, req.user);
  }
}
