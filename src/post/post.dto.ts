import { IsString, IsNotEmpty } from 'class-validator';

export class PostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
export class CommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
