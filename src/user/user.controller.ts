import {
  Body,
  Controller,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { SigninDto, SignupDto } from './user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    try {
      const user = await this.userService.signup(
        signupDto.name,
        signupDto.email,
        signupDto.password,
      );

      return {
        message: 'Dang ky thanh cong',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'dang k that bai',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('signin')
  async signin(@Body() signinDto: SigninDto) {
    try {
      const token = await this.userService.signin(
        signinDto.email,
        signinDto.password,
      );

      return {
        message: 'dang nhap thanh cong',
        access_token: token,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: 'dang nhap that bai',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
