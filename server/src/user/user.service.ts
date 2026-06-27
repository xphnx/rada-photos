import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    return user;
  }

  async findById(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    return user;
  }

  async findByYandexId(yandexId: string) {
    const user = await this.userRepository.findOne({
      where: {
        yandexId,
      },
    });

    return user;
  }

  async createYandexUser(email: string, yandexId: string) {
    const rawNewUser = this.userRepository.create({ email, yandexId });
    const newUser = await this.userRepository.save(rawNewUser);

    return newUser;
  }

  async addYandexId(user: User, yandexId: string) {
    user.yandexId = yandexId;
    const userWithYandexId = this.userRepository.save(user);

    return userWithYandexId;
  }

  async create(email: string, passwordHash: string) {
    const rawNewUser = this.userRepository.create({ email, passwordHash });
    const newUser = await this.userRepository.save(rawNewUser);

    return newUser;
  }

  async setPassword(userId: string, passwordHash: string) {
    await this.userRepository.update({ id: userId }, { passwordHash });
  }
}
