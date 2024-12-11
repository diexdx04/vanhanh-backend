import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LikeService {
  constructor(private readonly prisma: PrismaService) {}

  async toggleLike(userId: number, postId: number) {
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
      return { message: 'delete like' };
    } else {
      return this.prisma.like.create({
        data: {
          userId,
          postId,
        },
      });
    }
  }

  async getUsersLikedPost(postId: number) {
    console.log(postId, 6767667);

    const likes = await this.prisma.like.findMany({
      where: { postId },
      include: {
        user: true,
      },
    });
    return likes.map((likes) => likes.user.name);
  }
}
