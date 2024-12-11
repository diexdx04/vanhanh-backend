import { Controller, Get, Param, Post, Request } from '@nestjs/common';
import { LikeService } from './like.service';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post(':postId')
  async toggleLike(@Request() req, @Param('postId') postId: number) {
    try {
      const userId = req.user.userId;
      return this.likeService.toggleLike(userId, postId);
    } catch (error) {
      console.log(1111, error);
    }
  }

  @Get('post/:postId/users')
  async getUsersLikedPost(@Param('postId') postId: number) {
    return this.likeService.getUsersLikedPost(postId);
  }
}
