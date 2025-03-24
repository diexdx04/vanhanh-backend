import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { ErrorHttp } from 'src/error';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':profileId')
  async getProfile(@Param('profileId') profileId: number, @Request() req) {
    return this.profileService.getProfile(req.user.userId, profileId);
  }

  @Post(':profileId/follow')
  async Follow(@Request() req, @Param('profileId') profileId: number) {
    const userId = req.user.userId;

    return this.profileService.follow(userId, profileId);
  }

  @Delete(':profileId/follow')
  async deleteFollow(@Request() req, @Param('profileId') profileId: number) {
    console.log(req, 98989);

    const userId = req.user.userId;
    if (profileId !== userId) {
      throw new HttpException(ErrorHttp.Unauthorized, HttpStatus.UNAUTHORIZED);
    }
    const followingId = req.body.followingId;

    return this.profileService.deleteFollow(userId, followingId);
  }

  @Get(':profileId/following')
  async getFollowing(@Param('profileId') profileId: number, @Request() req) {
    return this.profileService.getFollowing(profileId, req.user.userId);
  }

  @Get(':profileId/follower')
  async getFollower(@Param('profileId') profileId: number, @Request() req) {
    return this.profileService.getFollower(profileId, req.user.userId);
  }

  @Get(':profileId/post')
  async getPosts(
    @Request() req,
    @Param('profileId') profileId: number,
    @Query('lastPostId') lastPostId: number = undefined,
    @Query('limit') limit: number = 3,
  ) {
    const userId = req.user.userId;
    return this.profileService.getPostsInProfile(
      profileId,
      userId,
      limit,
      lastPostId,
    );
  }
}
