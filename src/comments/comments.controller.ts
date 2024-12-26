import { Body, Controller, Param, Post, Request } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentDto } from './comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentService: CommentsService) {}

  @Post(':postId')
  async create(
    @Body() body: CommentDto,
    @Request() req,
    @Param('postId') postId: number,
  ) {
    const userId = req.user.userId;

    return await this.commentService.create(body.content, userId, postId);
  }
}
