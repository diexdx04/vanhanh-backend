import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class SignupDto {
  @IsNotEmpty({ message: 'ten khong duoc de trong' })
  @Length(3, undefined, { message: 'ten it nhat 3 ki tu ' })
  name: string;

  @IsNotEmpty({ message: 'email khong duoc de trong' })
  @IsEmail({}, { message: 'khong dung dinh dang email' })
  email: string;

  @IsNotEmpty({ message: 'mat khau khong duoc de trong' })
  @Length(6, 20, { message: 'mat khau phai tu 6 den 20 ky tu' })
  password: string;
}

export class AvatarDto {
  @IsOptional()
  @IsString()
  avatar?: string;
}
