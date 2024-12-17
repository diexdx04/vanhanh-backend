import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ErrorHttp } from 'src/error';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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

    const payload = { email: user.email, id: user.id };
    const token = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { id: user.id },
      { expiresIn: '90d' },
    );

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        refreshToken: refreshToken,
      },
    });
    return { token, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    const existingToken = await this.prisma.refreshToken.findUnique({
      where: { refreshToken },
    });

    if (!existingToken) {
      throw new HttpException(ErrorHttp.TOKEN_EXPIRED, HttpStatus.UNAUTHORIZED);
    }

    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
      });
      if (!user) {
        throw new HttpException(
          ErrorHttp.ACOUNT_EXIST,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const newAccessToken = this.jwtService.sign({
        email: user.email,
        id: user.id,
      });

      return { token: newAccessToken };
    } catch (error) {
      console.log(error);
      throw new HttpException(ErrorHttp.TOKEN_EXPIRED, HttpStatus.UNAUTHORIZED);
    }
  }
}
