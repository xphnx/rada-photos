import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Response } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt.guard';
import { CurrentUser } from './current-user.decorator';
import { User } from '../user/user.entity';
import { COOKIE_MAX_AGE } from '../config/config.constants';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private setAuthCookie(response: Response, token: string) {
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    };

    response.cookie('token', token, cookieOptions);
  }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { token, user } = await this.authService.register(dto);

    this.setAuthCookie(response, token);

    return user;
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { token, user } = await this.authService.login(dto);

    this.setAuthCookie(response, token);

    return user;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('token', { path: '/' });

    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User) {
    return this.authService.getProfile(user.id);
  }

  @Get('yandex')
  yandexAuth(@Res() response: Response) {
    const url = this.authService.getYandexAuthUrl();

    return response.redirect(url);
  }

  @Get('yandex/callback')
  async yandexCallback(@Query('code') code: string, @Res() response: Response) {
    const { token } = await this.authService.yandexLogin(code);

    this.setAuthCookie(response, token);

    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    return response.redirect(`${frontendUrl}/feed`);
  }
}
