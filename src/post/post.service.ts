import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ErrorHttp } from 'src/error';
import { PrismaService } from '../prisma/prisma.service';
import { PostDto } from './post.dto';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(createPostDto: PostDto, user: any) {
    const newPost = await this.prisma.posts.create({
      data: {
        ...createPostDto,
        authorId: user.userId,
      },
      include: {
        author: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    return {
      ...newPost,
      liked: false,
      _count: {
        Like: 0,
        Comment: 0,
      },
    };
  }

  async getPosts(userId: number, limit: number = 3, lastPostId?: number) {
    if (limit < 1) limit = 3;

    const posts = await this.prisma.posts.findMany({
      where: {
        id: lastPostId
          ? {
              lt: lastPostId,
            }
          : undefined,
      },
      include: {
        _count: {
          select: {
            Like: true,
            Comment: true,
          },
        },
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    const userLikes = await this.prisma.like.findMany({
      where: {
        userId: userId,
        postId: {
          in: posts.map((post) => post.id),
        },
      },
      select: {
        postId: true,
      },
    });

    const likePostId = new Set(userLikes.map((like) => like.postId));

    return posts.map((post) => {
      const userLiked = likePostId.has(post.id);

      return {
        ...post,
        liked: userLiked,
      };
    });
  }

  async getPostDetail(postId: number) {
    const postExist = await this.prisma.posts.findUnique({
      where: { id: postId },
    });

    if (!postExist) {
      throw new HttpException(ErrorHttp.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const postDeteail = await this.prisma.posts.findFirst({
      where: { id: postId },
      include: {
        author: {
          select: {
            name: true,
            id: true,
          },
        },

        _count: {
          select: {
            Like: true,
            Comment: true,
          },
        },
      },
    });

    return {
      ...postDeteail,
    };
  }

  async createComment(content: string, userId: number, postId: number) {
    const postExists = await this.prisma.posts.findUnique({
      where: { id: postId },
    });

    if (!postExists) {
      throw new HttpException(ErrorHttp.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const newComment = await this.prisma.comment.create({
      data: {
        content,
        userId,
        postId,
      },
    });
    return {
      id: newComment.id,
      content: newComment.content,
      createAt: newComment.createAt,
      userId: userId,
      name: user.name,
    };
  }

  async getPostComments(postId: number) {
    const postComments = await this.prisma.posts.findUnique({
      where: { id: postId },
      include: {
        Comment: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createAt: 'desc',
          },
        },
      },
    });

    if (!postComments) {
      throw new HttpException(ErrorHttp.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return {
      comments: postComments.Comment.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createAt: comment.createAt,
        userId: comment.user.id,
        name: comment.user.name,
      })),
    };
  }

  async deleteComment(postId: number, commentId: number, userId: number) {
    if (!commentId || !postId) {
      throw new HttpException(ErrorHttp.BAD_REQUEST, HttpStatus.BAD_REQUEST);
    }
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new HttpException(ErrorHttp.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (comment.userId !== userId) {
      throw new HttpException(ErrorHttp.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    await this.prisma.comment.delete({
      where: { id: commentId },
    });
  }

  async updateComment(postId: number, commentId: number, content: string) {
    if (!commentId || !postId || !content) {
      throw new HttpException(ErrorHttp.BAD_REQUEST, HttpStatus.BAD_REQUEST);
    }
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId, postId: postId },
    });

    if (comment.content === content) {
      throw new HttpException(ErrorHttp.CONFLICT, HttpStatus.CONFLICT);
    }

    if (!comment) {
      throw new HttpException(ErrorHttp.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { content: content, updatedAt: new Date() },
    });
  }

  async likePost(userId: number, postId: number) {
    const existingLike = await this.prisma.like.findFirst({
      where: {
        userId: userId,
        postId: postId,
      },
    });

    if (existingLike) {
      await this.prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      return { message: 'Post unliked successfully' };
    } else {
      try {
        await this.prisma.like.create({
          data: {
            userId,
            postId,
          },
        });
        return { message: 'Post liked successfully' };
      } catch (error) {
        console.log(error);

        throw new HttpException(
          ErrorHttp.INTERNAL_SERVER_ERROR,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
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
