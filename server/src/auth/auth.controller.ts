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
import type { Response } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt.guard';
import { CurrentUser } from './current-user.decorator';
import { User } from '../user/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  logout() {
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User) {
    return user;
  }

  @Get('yandex')
  yandexAuth(@Res() response: Response) {
    const url = this.authService.getYandexAuthUrl();

    return response.redirect(url);
  }

  @Get('yandex/callback')
  async yandexCallback(@Query('code') code: string, @Res() response: Response) {
    const { token } = await this.authService.yandexLogin(code);

    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    return response.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }
}
