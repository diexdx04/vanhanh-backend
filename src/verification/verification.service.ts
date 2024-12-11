import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VerificationService {
  constructor(private readonly prisma: PrismaService) {}

  async verifyToken(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new UnauthorizedException('Token xac thuc khong hop le!');
    }

    console.log('token xac thuc hop le', 666666);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: null, isVerified: true },
    });

    return user;
  }
}
