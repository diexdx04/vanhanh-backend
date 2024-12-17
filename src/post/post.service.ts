import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ErrorHttp } from 'src/error';
import { PrismaService } from '../prisma/prisma.service';
import { PostDto } from './valid/post.dto';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(createPostDto: PostDto, user: any) {
    return await this.prisma.posts.create({
      select: {
        id: true,
      },
      data: {
        id: 71,
        title: 'realmadrid',
        content: '15c1',
        authorId: user.userId,
      },
    });
  }

  async getPosts(userId: number) {
    const posts = await this.prisma.posts.findMany({
      include: {
        Like: {
          where: {
            userId: userId,
          },
        },
        _count: {
          select: {
            Like: true,
          },
        },
      },
      take: 2,
    });

    return posts.map((post) => {
      const userLiked = post.Like.length > 0;
      return {
        ...post,
        liked: userLiked,
        likeCount: post._count.Like || 0,
      };
    });
  }

  async getPostLikes(postId: number) {
    const postLikes = await this.prisma.posts.findUnique({
      where: { id: postId },
      include: {
        Like: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!postLikes) {
      throw new HttpException(ErrorHttp.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return {
      likers:
        postLikes.Like.map((like) => ({
          id: like.user.id,
          name: like.user.name,
        })) || [],
    };
  }
}
