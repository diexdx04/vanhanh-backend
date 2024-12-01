import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
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
      const token = await this.authService.signin(
        signinDto.email,
        signinDto.password,
      );

      return {
        message: 'dang nhap thanh cong',
        token,
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
