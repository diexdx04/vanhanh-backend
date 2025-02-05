import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PostDto {
  @IsOptional()
  @IsString()
  images?: string[];

  @IsNotEmpty()
  @IsString()
  content: string;
}
export class CommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
