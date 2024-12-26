import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class SigninDto {
  @IsNotEmpty({ message: 'email khong duoc de trong' })
  @IsEmail({}, { message: 'khong dung dinh dang email' })
  email: string;

  @IsNotEmpty({ message: 'mat khau khong duoc de trong' })
  @Length(6, 20, { message: 'mat khau phai tu 6 den 20 ky tu' })
  password: string;
}
