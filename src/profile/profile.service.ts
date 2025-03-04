import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ErrorHttp } from 'src/error';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  // lay danh sachh follow cua nguoi dung
  async getProfile(userId: number, profileId: number) {
    const profile = await this.prisma.user.findUnique({
      where: { id: profileId },
      include: {
        _count: {
          select: {
            follower: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    if (!profile) {
      throw new HttpException(ErrorHttp.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const existFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: profileId,
        },
      },
    });
    return {
      profile,
      isFollowing: existFollow !== null,
    };
  }

  // follow
  async follow(userId: number, followingId: number) {
    const existFollowing = await this.prisma.user.findUnique({
      where: {
        id: followingId,
      },
    });

    if (!existFollowing) {
      throw new HttpException(ErrorHttp.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (userId === followingId) {
      throw new HttpException(ErrorHttp.BAD_REQUEST, HttpStatus.BAD_REQUEST);
    }

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: followingId,
        },
      },
    });

    if (!existingFollow) {
      const newFollow = await this.prisma.follow.create({
        data: {
          followerId: userId,
          followingId: followingId,
        },
      });
      return { newFollow, message: ' follow successfully' };
    } else {
      const unFollow = await this.prisma.follow.delete({
        where: {
          id: existingFollow.id,
        },
      });
      return { unFollow, message: ' unfollow successfully' };
    }
  }

  // (ban than minh tu huy theo doi cua nguoi khac doi voi minh)
  async deleteFollow(userId: number, followerId: number) {
    const existFollower = await this.prisma.user.findUnique({
      where: {
        id: followerId,
      },
    });
    if (!existFollower) {
      throw new HttpException(ErrorHttp.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: userId,
        },
      },
    });
    if (!existingFollow) {
      throw new HttpException(ErrorHttp.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this.prisma.follow.delete({
      where: { id: existingFollow.id },
    });

    return { messgae: 'delete follow successfully' };
  }

  // get following
  private async fetchFollowingList(profileId: number) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: profileId },
      include: { following: true },
    });

    return following.map((follow) => ({
      id: follow.following.id,
      name: follow.following.name,
    }));
  }

  async getFollowing(profileId: number, viewrId: number) {
    const existProfile = await this.prisma.user.findUnique({
      where: {
        id: profileId,
      },
    });

    if (!existProfile) {
      throw new HttpException(ErrorHttp.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (viewrId === profileId) {
      return await this.fetchFollowingList(profileId);
    }

    if (existProfile.isPrivate) {
      const isFollowing = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: viewrId,
            followingId: profileId,
          },
        },
      });

      if (!isFollowing) {
        throw new HttpException(ErrorHttp.FORBIDDEN, HttpStatus.FORBIDDEN);
      }
    }
    return await this.fetchFollowingList(profileId);
  }

  private async fetchFollowerList(profileId: number) {
    const getFollower = await this.prisma.follow.findMany({
      where: {
        followingId: profileId,
      },
      include: {
        follower: true,
      },
    });

    console.log(getFollower, 99999);

    return getFollower.map((follow) => ({
      id: follow.follower.id,
      name: follow.follower.name,
    }));
  }

  async getFollower(profileId: number, viewrId: number) {
    console.log(viewrId, profileId, 6666);

    const existProfile = await this.prisma.user.findUnique({
      where: { id: profileId },
    });

    if (!existProfile) {
      throw new HttpException(ErrorHttp.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (viewrId === profileId) {
      return await this.fetchFollowerList(profileId);
    }

    if (existProfile.isPrivate) {
      const isFollowing = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: viewrId,
            followingId: profileId,
          },
        },
      });

      if (!isFollowing) {
        throw new HttpException(ErrorHttp.FORBIDDEN, HttpStatus.FORBIDDEN);
      }
      return await this.fetchFollowerList(profileId);
    }
  }

  // lay danh danh bai viet cua profile
  private async fetchPostsInProfile(
    profileId: number,
    userId: number,
    limit: number,
    lastPostId?: number,
  ) {
    if (limit < 1) limit = 3;

    const posts = await this.prisma.posts.findMany({
      where: {
        authorId: profileId,
        deleted: false,
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

  async getPostsInProfile(
    profileId: number,
    userId: number,
    limit: number = 3,
    lastPostId?: number,
  ) {
    const existProfile = await this.prisma.user.findUnique({
      where: { id: profileId },
    });

    if (!existProfile) {
      throw new HttpException(ErrorHttp.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (userId === profileId) {
      return await this.fetchPostsInProfile(
        profileId,
        userId,
        limit,
        lastPostId,
      );
    }

    if (existProfile.isPrivate) {
      const isFollowing = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: profileId,
          },
        },
      });
      if (!isFollowing) {
        throw new HttpException(ErrorHttp.FORBIDDEN, HttpStatus.FORBIDDEN);
      }
    }

    return await this.fetchPostsInProfile(profileId, userId, limit, lastPostId);
  }
}
