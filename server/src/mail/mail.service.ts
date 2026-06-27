import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.yandex.ru',
      port: 465,
      secure: true,
      auth: {
        user: this.config.getOrThrow<string>('SMTP_USER'),
        pass: this.config.getOrThrow<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendPasswordReset(to: string, link: string) {
    await this.transporter.sendMail({
      from: this.config.getOrThrow<string>('SMTP_FROM'),
      to,
      subject: 'Восстановление пароля — Loverly Crew',
      html: `
        <p>Вы запросили сброс пароля в Loverly Crew.</p>
        <p>Чтобы задать новый пароль, перейдите по ссылке (действует 1 час):</p>
        <p><a href="${link}">${link}</a></p>
        <p>Если вы не запрашивали сброс — просто проигнорируйте письмо.</p>
      `,
    });
  }
}
