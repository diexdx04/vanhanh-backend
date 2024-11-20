import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prima: PrismaService) {}

  async signup(name: string, email: string, password: string) {
    try {
      const exitedEMail = await this.prima.user.findUnique({
        where: { email },
      });

      if (exitedEMail) {
        throw new ConflictException('email da ton tai');
      }

      const hashPassword = await bcrypt.hash(password, 10);
      return this.prima.user.create({
        data: {
          name,
          email,
          password: hashPassword,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
