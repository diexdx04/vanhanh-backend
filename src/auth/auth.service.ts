import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ErrorHttp } from 'src/error';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async signin(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new HttpException(
        ErrorHttp.EMAIL_NO_EXITS,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException(
        ErrorHttp.INCORRECT_PASSWORD,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = this.tokenService.generateAccessToken(user.id, user.email);
    const refreshToken = this.tokenService.generateRefreshToken(user.id);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        refreshToken,
      },
    });

    return {
      token,
      refreshToken,
      userId: user.id,
      isVerified: user.isVerified,
    };
  }

  async refreshToken(refreshToken: string) {
    const payload = await this.tokenService.validateRefreshToken(refreshToken);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });
    if (!user) {
      throw new HttpException(ErrorHttp.ACOUNT_EXIST, HttpStatus.UNAUTHORIZED);
    }

    const newAccessToken = this.tokenService.generateAccessToken(
      user.id,
      user.email,
    );

    return { token: newAccessToken, userId: user.id };
  }
}
