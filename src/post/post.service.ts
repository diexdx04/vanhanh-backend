import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ErrorHttp } from 'src/error';
import { PrismaService } from '../prisma/prisma.service';
import { PostDto } from './valid/post.dto';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(createPostDto: PostDto, user: any) {
    const newPost = await this.prisma.posts.create({
      data: {
        ...createPostDto,
        authorId: user.userId,
      },
    });

    return {
      ...newPost,
      liked: false,
      likeCount: 0,
    };
  }

  async getPosts(userId: number, page: number = 1, limit: number = 3) {
    if (page < 1) page = 1;
    if (limit < 1) limit = 3;

    const skip = (page - 1) * limit;
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
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
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
