import {
  Controller,
  Get,
  Query,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { VerificationService } from './verification.service';
import { AuthService } from 'src/auth/auth.service';
import { Public } from 'src/auth/public';

@Controller('verify')
export class VerificationController {
  constructor(
    private readonly verificationService: VerificationService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Get()
  async verify(@Query('token') token: string, @Res() res: Response) {
    try {
      await this.verificationService.verifyToken(token);
      // const { refreshToken } = await this.authService.signin(
      //   user.email,
      //   user.password,
      // );
      res.send('tai khoan xac thuc thanh cong!');
    } catch (error) {
      console.log(error);

      throw new UnauthorizedException('Loi xac thuc!');
    }
  }
}
