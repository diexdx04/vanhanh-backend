import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private readonly prima: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

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

  async signin(email: string, password: string) {
    const user = await this.prima.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email khong ton tai!');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Mat khau khong chinh xac!');
    }

    const payload = { email: user.email, id: user.id };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }
}
