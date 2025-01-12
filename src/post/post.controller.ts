import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import { EventsGateway } from 'src/socket/events.gateway';
import { CommentDto, PostDto } from './post.dto';
import { PostService } from './post.service';
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @Post('')
  async createPost(@Body() body: PostDto, @Request() req) {
    const newPost = await this.postService.createPost(body, req.user);
    // this.eventsGateway.server.emit('newPost', newPost);
    this.eventsGateway.handleNewPost(newPost);

    return newPost;
  }

  @Get('')
  async getPosts(
    @Request() req,
    @Query('lastPostId') lastPostId: number = undefined,
    @Query('limit') limit: number = 3,
  ) {
    const userId = req.user.userId;
    return this.postService.getPosts(userId, limit, lastPostId);
  }

  @Get(':postId')
  async getPostDetail(@Param('postId') postId: number) {
    return this.postService.getPostDetail(postId);
  }

  @Post(':postId/like')
  async likePost(@Request() req, @Param('postId') postId: number) {
    const userId = req.user.userId;
    return this.postService.likePost(userId, postId);
  }

  @Get(':postId/like')
  async getPostLikes(@Param('postId') postId: number) {
    return this.postService.getPostLikes(postId);
  }

  @Post(':postId/comment')
  async createComment(
    @Body() body: CommentDto,
    @Request() req,
    @Param('postId') postId: number,
  ) {
    const userId = req.user.userId;
    const content = body.content;

    console.log(userId, 88888888);

    const newComment = await this.postService.createComment(
      content,
      userId,
      postId,
    );
    this.eventsGateway.handleNewComment(newComment, postId);
    return newComment;
  }

  @Get(':postId/comment')
  async getComments(@Param('postId') postId: number) {
    return this.postService.getPostComments(postId);
  }

  @Delete(':postId/comment/:commentId')
  async deleteComment(
    @Param('postId') postId: number,
    @Param('commentId') commentId: number,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.postService.deleteComment(postId, commentId, userId);
  }

  @Put(':postId/comment/:commentId')
  async updateComment(
    @Param('postId') postId: number,
    @Param('commentId') commentId: number,
    @Body() body: CommentDto,
  ) {
    const content = body.content;
    return this.postService.updateComment(postId, commentId, content);
  }
}
