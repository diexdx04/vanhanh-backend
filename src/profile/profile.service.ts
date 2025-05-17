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

  private async fetchPhotos(profileId: number, page: number, limit: number) {
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
        id: avatar.id,
        url: avatar.url,
        createdAt: avatar.createdAt,
        isAvt: true,
      });
    });

    all_images.posts.forEach((post) => {
      post.images.forEach((image) => {
        imageList.push({
          id: image.id,
          url: image.url,
          createdAt: post.createdAt,
          isAvt: false,
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
      return await this.fetchPhotos(profileId, page, limit);
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
    return await this.fetchPhotos(profileId, page, limit);
  }

  async getDetailPhoto(photoId: string, isAvatar: boolean) {
    if (isAvatar) {
      const photo = await this.prisma.avatar.findUnique({
        where: { id: photoId },
      });

      const user = await this.prisma.user.findUnique({
        where: { id: photo.userId },
        include: {
          avatars: {
            where: {
              isCurrent: true,
            },
          },
        },
      });

      if (!photo || !user) {
        throw new HttpException(ErrorHttp.NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { email, password, verificationToken, isVerified, ...author } =
        user;

      return { photo, author };
    } else {
      const photo = await this.prisma.image.findUnique({
        where: { id: photoId },
      });

      const post = await this.prisma.posts.findUnique({
        where: {
          id: photo.postId,
        },
      });

      const user = await this.prisma.user.findUnique({
        where: { id: post.authorId },
        include: {
          avatars: {
            where: {
              isCurrent: true,
            },
          },
        },
      });

      if (!photo || !user) {
        throw new HttpException(ErrorHttp.NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { email, password, verificationToken, isVerified, ...author } =
        user;

      if (!photo) {
        throw new HttpException(ErrorHttp.NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      return { photo, author };
    }
  }

  async updateName(newName: string, userId: number) {
    console.log(newName, 999);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException(ErrorHttp.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (newName === user.name) {
      throw new HttpException(ErrorHttp.BAD_REQUEST, HttpStatus.BAD_REQUEST);
    }

    try {
      const updateUser = await this.prisma.user.update({
        where: { id: userId },
        data: { name: newName },
      });

      return {
        statusCode: HttpStatus.OK,
        updateUser,
      };
    } catch (error) {
      console.log(error);
    }
  }
}
