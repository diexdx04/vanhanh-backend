import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { SignupDto } from './user.dto';
import { UserService } from './user.service';
import { Public } from 'src/auth/public';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
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
}
