import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { Public } from './public';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signin')
  async signin(@Body() signinDto: SigninDto) {
    try {
      const { token, refreshToken } = await this.authService.signin(
        signinDto.email,
        signinDto.password,
      );

      return {
        message: 'dang nhap thanh cong',
        token: token,
        refreshToken: refreshToken,
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

  @Public()
  @Post('refresh-token')
  async refresh(@Body('refreshToken') refreshToken: string) {
    console.log('refresh token thanh cong 5555');

    try {
      const tokens = await this.authService.refreshToken(refreshToken);
      return {
        message: 'Refresh token thanh cong',
        ...tokens,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: error.message,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
