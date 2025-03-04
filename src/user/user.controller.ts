import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { Public } from 'src/auth/public';
import { SignupDto } from './user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('')
  async signup(@Body() signupDto: SignupDto) {
    return await this.userService.signup(
      signupDto.name,
      signupDto.email,
      signupDto.password,
    );
  }

  @Get()
  async getUser(@Request() req) {
    return this.userService.getUser(req.user.userId);
  }

  @Post('isPrivate')
  async togglePrivacy(@Request() req) {
    return this.userService.togglePrivacy(req.user.userId);
  }
}
