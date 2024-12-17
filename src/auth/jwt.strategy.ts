import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorHttp } from 'src/error';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user)
      throw new HttpException(
        ErrorHttp.EMAIL_NO_EXITS,
        HttpStatus.UNAUTHORIZED,
      );

    return { userId: payload.id, email: payload.email };
  }
}
