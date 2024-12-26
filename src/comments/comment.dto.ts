import { IsNotEmpty } from 'class-validator';

export class CommentDto {
  @IsNotEmpty({ message: 'Khong de trong!' })
  content: string;
}
