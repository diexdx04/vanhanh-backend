import { Controller, Param, Post, Request } from '@nestjs/common';
import { LikeService } from './like.service';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post(':postId')
  async likePost(@Request() req, @Param('postId') postId: number) {
    const userId = req.user.userId;
    return this.likeService.likePost(userId, postId);
  }
}
