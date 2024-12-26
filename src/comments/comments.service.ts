import { Injectable } from '@nestjs/common';
import { Comment } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    content: string,
    userId: number,
    postId: number,
  ): Promise<Comment> {
    return await this.prisma.comment.create({
      data: {
        content,
        postId,
        userId,
      },
    });
  }

  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return await this.prisma.comment.findMany({
      where: {
        postId,
      },
    });
  }

  async getCommentsByUserId(userId: number): Promise<Comment[]> {
    return await this.prisma.comment.findMany({
      where: {
        userId,
      },
    });
  }
}
