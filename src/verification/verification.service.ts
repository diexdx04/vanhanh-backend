import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { EmailService } from 'src/email/email.service';
import { ErrorHttp } from 'src/error';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventsGateway } from 'src/socket/events.gateway';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class VerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async verifyUser(verifyToken: string) {
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: verifyToken },
    });

    if (!user) {
      throw new HttpException(ErrorHttp.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: null, isVerified: true },
    });

    const token = this.tokenService.generateAccessToken(user.id, user.email);
    const refreshToken = this.tokenService.generateRefreshToken(user.id);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        refreshToken,
      },
    });

    this.eventsGateway.emitUserVerified(user.id, true);

    return { token, refreshToken, userId: user.id };
  }

  async sendEmail(userId: number) {
    const newVerifyCode = crypto.randomBytes(20).toString('hex');
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationToken: newVerifyCode,
      },
    });

    if (!user) {
      throw new HttpException(ErrorHttp.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return await this.emailService.sendWelcomeEmail(
      user.email,
      user.verificationToken,
    );
  }
}
