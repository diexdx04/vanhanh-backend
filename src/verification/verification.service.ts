import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ErrorHttp } from 'src/error';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VerificationService {
  constructor(private readonly prisma: PrismaService) {}

  async verifyToken(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new HttpException(ErrorHttp.TOKEN_EXPIRED, HttpStatus.UNAUTHORIZED);
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: null, isVerified: true },
    });

    return user;
  }
}
