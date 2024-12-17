import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { Public } from './public';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('')
  async signin(@Body() signinDto: SigninDto) {
    const { token, refreshToken } = await this.authService.signin(
      signinDto.email,
      signinDto.password,
    );

    return {
      token: token,
      refreshToken: refreshToken,
    };
  }

  @Public()
  @Post('refresh-token')
  async refresh(@Body('refreshToken') refreshToken: string) {
    const tokens = await this.authService.refreshToken(refreshToken);
    return {
      ...tokens,
    };
  }
}
