import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ErrorHttp } from 'src/error';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LikeService {
  constructor(private readonly prisma: PrismaService) {}

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
}
