import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/api/prisma/prisma.service';

type JwtPayload = {
  sub: string;
  username: string;
  role: string;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    const jwtSecret = configService.get<string>('JWT_ACCESS_SECRET');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prismaService.users.findUnique({
      where: {
        username: payload.username,
      },
      include: {
        branch: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return {
      sub: user.id,
      username: user.username,
      role: user.role,
      inn: user.branch?.inn,
      branchId: user.branchId,
      prefix: user.branch?.prefix,
    };
  }
}
