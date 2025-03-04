import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EmailService } from 'src/email/email.service';
import { ErrorHttp } from 'src/error';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
  ) {}

  async getUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException(ErrorHttp.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async signup(name: string, email: string, password: string) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new HttpException(ErrorHttp.ACOUNT_EXIST, HttpStatus.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const newUser = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          verificationToken: crypto.randomBytes(20).toString('hex'),
        },
      });

      // Gửi email xác minh
      this.emailService.sendWelcomeEmail(
        newUser.email,
        newUser.verificationToken,
      );
      const token = this.tokenService.generateAccessToken(
        newUser.id,
        newUser.email,
      );
      const refreshToken = this.tokenService.generateRefreshToken(newUser.id);

      // Lưu refresh token vào cơ sở dữ liệu
      await this.prisma.refreshToken.create({
        data: {
          userId: newUser.id,
          refreshToken,
        },
      });
      return { token, refreshToken, userId: newUser.id };
    } catch (error) {
      console.error(error, 7676767667676);

      throw new HttpException(
        'Unable to create user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async togglePrivacy(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException(ErrorHttp.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { isPrivate: !user.isPrivate },
    });

    return { isPrivate: updatedUser.isPrivate };
  }
}
