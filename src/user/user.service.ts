import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(
    private readonly prima: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async signup(name: string, email: string, password: string): Promise<User> {
    try {
      const exitedEMail = await this.prima.user.findUnique({
        where: { email },
      });

      if (exitedEMail) {
        throw new ConflictException('email da ton tai');
      }

      const hashPassword = await bcrypt.hash(password, 10);
      const newUser = await this.prima.user.create({
        data: {
          name,
          email,
          password: hashPassword,
          verificationToken: crypto.randomBytes(20).toString('hex'),
        },
      });
      this.emailService.sendWelcomeEmail(
        newUser.email,
        newUser.verificationToken,
      );

      return newUser;
    } catch (error) {
      console.log(error, 444);

      throw error;
    }
  }
}
