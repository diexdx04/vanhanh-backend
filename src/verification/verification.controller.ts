import { Controller, Get, Post, Query, Request } from '@nestjs/common';
import { Public } from 'src/auth/public';
import { VerificationService } from './verification.service';

@Controller('verify')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Public()
  @Get('')
  async verify(@Query('verifyToken') verifyToken: string) {
    return await this.verificationService.verifyUser(verifyToken);
  }

  @Post('')
  async sendeMail(@Request() req) {
    const userId = req.user.userId;
    console.log(req, 7777);

    return await this.verificationService.sendEmail(userId);
  }
}
