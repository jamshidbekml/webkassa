import { Controller, Body, Req, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { GetMe, SignIn } from './decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from './decorators/public.decorator';
import { RefreshTokenGuard } from './guards/refreshToken.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SignIn('signin')
  create(@Body() createAuthDto: AuthDto) {
    return this.authService.signin(createAuthDto);
  }

  @GetMe('getme')
  getMe(@Req() req: Request) {
    const obj = req['user'] as { username: string };
    return this.authService.getMe(obj.username);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Req() req: Request) {
    const userId = req['user']['sub'];
    const refreshToken = req['user']['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
