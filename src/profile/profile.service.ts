import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ErrorHttp } from 'src/error';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: number, profileId: number) {
    const profile = await this.prisma.user.findUnique({
      where: { id: profileId },
      include: {
        avatars: {
          where: { isCurrent: true },
        },
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
          followerId: profileId,
          followingId: userId,
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, email, verificationToken, ...data } = profile;

    if (userId === profileId) {
      return { data };
    }
    return {
      data,
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
          followerId: followingId,
          followingId: userId,
        },
      },
    });

    if (!existingFollow) {
      const newFollow = await this.prisma.follow.create({
        data: {
          followerId: followingId,
          followingId: userId,
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
  async deleteFollow(userId: number, followingId: number) {
    const existFollowing = await this.prisma.user.findUnique({
      where: {
        id: followingId,
      },
    });
    if (!existFollowing) {
      throw new HttpException(ErrorHttp.NOT_FOUND, HttpStatus.NOT_FOUND);
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
      console.log(2222);

      const isFollowing = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: profileId,
            followingId: viewrId,
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

    return getFollower.map((follow) => ({
      id: follow.follower.id,
      name: follow.follower.name,
    }));
  }

  async getFollower(profileId: number, viewrId: number) {
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
            followerId: profileId,
            followingId: viewrId,
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
        images: true,
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
            followerId: profileId,
            followingId: userId,
          },
        },
      });
      if (!isFollowing) {
        throw new HttpException(ErrorHttp.FORBIDDEN, HttpStatus.FORBIDDEN);
      }
    }

    return await this.fetchPostsInProfile(profileId, userId, limit, lastPostId);
  }

  private async fetchImage(profileId: number, page: number, limit: number) {
    const all_images = await this.prisma.user.findUnique({
      where: { id: profileId },
      include: {
        avatars: true,
        posts: {
          include: {
            images: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    const imageList = [];

    all_images.avatars.forEach((avatar) => {
      imageList.push({
        url: avatar.url,
        createdAt: avatar.createdAt,
        isAvatar: true,
        authorId: avatar.userId,
        // avatar,
      });
    });

    all_images.posts.forEach((post) => {
      post.images.forEach((image) => {
        imageList.push({
          url: image.url,
          createdAt: post.createdAt,
          isAvatar: false,
          authorId: post.authorId,
          // post,
        });
      });
    });
    const sortedImages = imageList.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    const startIndex = (page - 1) * limit;
    const images = sortedImages.slice(startIndex, startIndex + limit);

    console.log(images, 9999);

    return {
      images,
    };
  }

  async getPhotos(
    profileId: number,
    viewrId: number,
    limit: number,
    page: number,
  ) {
    const existProfile = await this.prisma.user.findUnique({
      where: { id: profileId },
    });
    if (!existProfile) {
      throw new HttpException(ErrorHttp.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (viewrId === profileId) {
      return await this.fetchImage(profileId, page, limit);
    }

    if (existProfile.isPrivate) {
      const isFollowing = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: profileId,
            followingId: viewrId,
          },
        },
      });
      if (!isFollowing) {
        throw new HttpException(ErrorHttp.FORBIDDEN, HttpStatus.FORBIDDEN);
      }
    }
    return await this.fetchImage(profileId, page, limit);
  }
}
