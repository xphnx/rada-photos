import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { YANDEX_LOGIN } from '../config/config.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private buildAuthResponse(user: User) {
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { token, user: this.sanitizeUser(user) };
  }

  private sanitizeUser(user: User) {
    const { passwordHash, ...safeUser } = user;

    return safeUser;
  }

  private async exchangeCodeForToken(code: string) {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: this.configService.getOrThrow(YANDEX_LOGIN.YANDEX_CLIENT_ID),
      client_secret: this.configService.getOrThrow(
        YANDEX_LOGIN.YANDEX_CLIENT_SECRET,
      ),
    });

    const response = await fetch('https://oauth.yandex.ru/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      throw new UnauthorizedException('Не удалось получить токен Яндекса');
    }

    const data = (await response.json()) as { access_token: string };

    return data.access_token;
  }

  private async fetchYandexProfile(accessToken: string) {
    const response = await fetch('https://login.yandex.ru/info?format=json', {
      headers: { Authorization: `OAuth ${accessToken}` },
    });

    if (!response.ok) {
      throw new UnauthorizedException('Не удалось получить профиль Яндекса');
    }

    return (await response.json()) as {
      id: string;
      default_email: string;
    };
  }

  private async findOrCreateYandexUser(profile: {
    id: string;
    default_email: string;
  }) {
    const byYandex = await this.userService.findByYandexId(profile.id);

    if (byYandex) {
      return byYandex;
    }

    const byEmail = await this.userService.findByEmail(profile.default_email);

    if (byEmail) {
      return this.userService.addYandexId(byEmail, profile.id);
    }

    return this.userService.createYandexUser(profile.default_email, profile.id);
  }

  async register(dto: RegisterDto) {
    const user = await this.userService.findByEmail(dto.email);

    if (user) {
      throw new ConflictException('Email уже зарегистрирован!');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const newUser = await this.userService.create(dto.email, passwordHash);

    return newUser;
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);

    if (!user || !user.passwordHash) {
      return new UnauthorizedException('Неверные логин и/или пароль!');
    }

    const isValidPassword = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isValidPassword) {
      return new UnauthorizedException('Неверные логин и/или пароль!');
    }

    return this.buildAuthResponse(user);
  }

  async yandexLogin(code: string) {
    const accessToken = await this.exchangeCodeForToken(code);
    const profile = await this.fetchYandexProfile(accessToken);

    const user = await this.findOrCreateYandexUser(profile);

    return this.buildAuthResponse(user);
  }

  getYandexAuthUrl() {
    const clientId = this.configService.getOrThrow<string>(
      YANDEX_LOGIN.YANDEX_CLIENT_ID,
    );
    const redirectUri = this.configService.getOrThrow<string>(
      YANDEX_LOGIN.YANDEX_CALLBACK_URL,
    );

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
    });

    return `https://oauth.yandex.ru/authorize?${params.toString()}`;
  }
}
