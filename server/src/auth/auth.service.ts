import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { YANDEX_LOGIN } from '../config/config.constants';
import { isAdminEmail } from './admin/admin.util';
import { PasswordResetToken } from './password-reset-token.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokens: Repository<PasswordResetToken>,
    private readonly mailService: MailService,
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

    return this.buildAuthResponse(newUser);
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Неверные логин и/или пароль!');
    }

    const isValidPassword = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Неверные логин и/или пароль!');
    }

    return this.buildAuthResponse(user);
  }

  async yandexLogin(code: string) {
    const accessToken = await this.exchangeCodeForToken(code);
    const profile = await this.fetchYandexProfile(accessToken);

    const user = await this.findOrCreateYandexUser(profile);

    return this.buildAuthResponse(user);
  }

  async getProfile(userId: string) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      hasPassword: user.passwordHash !== null,
      hasYandex: user.yandexId !== null,
      isAdmin: isAdminEmail(user.email, this.configService),
    };
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

  async requestPasswordReset(email: string) {
    const user = await this.userService.findByEmail(email);

    if (user) {
      await this.resetTokens.delete({ user: { id: user.id } });

      const token = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(token).digest('hex');

      await this.resetTokens.save(
        this.resetTokens.create({
          user: { id: user.id },
          tokenHash,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        }),
      );

      const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
      const link = `${frontendUrl}/reset-password?token=${token}`;
      try {
        await this.mailService.sendPasswordReset(user.email, link);
      } catch (error) {
        console.error('Не удалось отправить письмо сброса:', error);
      }
    }

    return { success: true };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const record = await this.resetTokens.findOne({
      where: { tokenHash },
      relations: { user: true },
    });

    if (!record || record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Ссылка недействительна или устарела');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userService.setPassword(record.user.id, passwordHash);

    await this.resetTokens.delete({ user: { id: record.user.id } });

    return { success: true };
  }
}
