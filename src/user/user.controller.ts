import { Body, Controller, Post } from '@nestjs/common';
import { Public } from 'src/auth/public';
import { SignupDto } from './user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('')
  async signup(@Body() signupDto: SignupDto) {
    const user = await this.userService.signup(
      signupDto.name,
      signupDto.email,
      signupDto.password,
    );

    return {
      message: 'Registration successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
