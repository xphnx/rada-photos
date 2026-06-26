import { ConfigService } from '@nestjs/config';

export function isAdminEmail(email: string, config: ConfigService): boolean {
  const admins = (config.get<string>('ADMIN_EMAILS') ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return admins.includes(email.toLowerCase());
}
