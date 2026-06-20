import { ConflictException, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async register(dto: RegisterDto) {
    const user = await this.userService.findByEmail(dto.email);

    if (user) {
      throw new ConflictException();
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const newUser = await this.userService.create(dto.email, passwordHash);

    return newUser;
  }
}
