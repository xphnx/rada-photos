import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';

import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '../user/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
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
}
