import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EmailService } from 'src/email/email.service';
import { ErrorHttp } from 'src/error';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenService } from 'src/token/token.service';
import { AvatarDto } from './user.dto';

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
      include: {
        avatars: {
          where: {
            isCurrent: true,
          },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new HttpException(ErrorHttp.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, password, verificationToken, ...data } = user;

    return data;
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

  async createAvatar(userId: number, avatarDto: AvatarDto) {
    if (!avatarDto.avatar) {
      throw new HttpException(ErrorHttp.BAD_REQUEST, HttpStatus.BAD_REQUEST);
    }

    const currentAvt = await this.prisma.avatar.findFirst({
      where: { userId: userId, isCurrent: true },
    });

    if (currentAvt) {
      await this.prisma.avatar.updateMany({
        where: { userId: userId, isCurrent: true },
        data: { isCurrent: false },
      });
    }

    const avatar = await this.prisma.avatar.create({
      data: {
        url: avatarDto.avatar,
        userId: userId,
        isCurrent: true,
      },
    });
    return {
      status: 200,
      data: avatar,
    };
  }
}
