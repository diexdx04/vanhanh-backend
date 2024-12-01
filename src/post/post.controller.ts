import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './valid/post.dto';
import { Public } from 'src/auth/public';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('create')
  async createPost(@Body() body: CreatePostDto, @Request() req) {
    return this.postService.createPost(body, req.user);
  }

  @Public()
  @Get('getPosts')
  async getPosts() {
    try {
      return this.postService.getPosts();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
