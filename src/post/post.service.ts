import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './valid/post.dto';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(createPostDto: CreatePostDto, user: any) {
    return this.prisma.posts.create({
      data: {
        ...createPostDto,
        authorId: user.authorId,
      },
    });
  }

  async getPosts() {
    return this.prisma.posts.findMany();
  }
}
