import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signin(data: AuthDto) {
    const user = await this.userService.findByUsername(data.username);
    if (!user) throw new BadRequestException('User not found');

    const passwordMatches = await argon2.verify(user.password, data.password);
    if (!passwordMatches)
      throw new UnauthorizedException('Password does not match');

    const tokens = await this.getTokens(user.id, user.username, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken.token);

    return { ...tokens, role: user.role };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);

    await this.userService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(userId: string, username: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
          role: role,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '1h',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
          role: role,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '12h',
        },
      ),
    ]);

    const decodedAccessToken = this.jwtService.decode(accessToken) as {
      exp: number;
    };
    const decodedRefreshToken = this.jwtService.decode(refreshToken) as {
      exp: number;
    };

    return {
      accessToken: {
        token: accessToken,
        expiresIn: new Date(decodedAccessToken.exp * 1000),
      },
      refreshToken: {
        token: refreshToken,
        expiresIn: new Date(decodedRefreshToken.exp * 1000),
      },
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userService.findByid(userId);
    if (!user || !user.data.refreshToken)
      throw new ForbiddenException('Access Denied');

    const refreshTokenMatches = await argon2.verify(
      user.data.refreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const tokens = await this.getTokens(
      user.data.id,
      user.data.username,
      user.data.role,
    );
    await this.updateRefreshToken(user.data.id, tokens.refreshToken.token);
    return tokens;
  }

  async logout(userId: string) {
    await this.userService.update(userId, {
      refreshToken: null,
    });
  }

  hashData(data: string) {
    return argon2.hash(data);
  }

  async getMe(username: string) {
    return await this.userService.findByUsername(username);
  }
}
