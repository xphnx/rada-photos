import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { isAdminEmail } from './admin.util';
import { User } from '../../user/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const request = ctx.switchToHttp().getRequest<{ user?: User }>();
    const email = request.user?.email;

    if (!email || !isAdminEmail(email, this.configService)) {
      throw new ForbiddenException('Доступно только администратору');
    }

    return true;
  }
}
