import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EmailService } from 'src/email/email.service';
import { ErrorHttp } from 'src/error';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async signup(name: string, email: string, password: string): Promise<User> {
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

      this.emailService.sendWelcomeEmail(
        newUser.email,
        newUser.verificationToken,
      );

      return newUser;
    } catch (error) {
      console.error(error);

      throw new HttpException(
        'Unable to create user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
