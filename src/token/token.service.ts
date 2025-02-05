import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ErrorHttp } from 'src/error';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  // Tạo Access Token
  generateAccessToken(userId: number, email: string) {
    const payload = { email, id: userId };
    return this.jwtService.sign(payload);
  }

  // Tạo Refresh Token
  generateRefreshToken(userId: number) {
    return this.jwtService.sign({ id: userId }, { expiresIn: '30d' });
  }

  // Xác thực Refresh Token
  async validateRefreshToken(refreshToken: string) {
    const existingToken = await this.prisma.refreshToken.findUnique({
      where: { refreshToken },
    });

    if (!existingToken) {
      throw new HttpException(ErrorHttp.TOKEN_EXPIRED, HttpStatus.UNAUTHORIZED);
    }

    try {
      return this.jwtService.verify(refreshToken);
    } catch (error) {
      console.log(error);

      throw new HttpException(ErrorHttp.TOKEN_EXPIRED, HttpStatus.UNAUTHORIZED);
    }
  }
}
