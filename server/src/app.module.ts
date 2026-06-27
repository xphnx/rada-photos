import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PhotosModule } from './photos/photos.module';
import { CommentModule } from './comment/comment.module';
import { ReactionsModule } from './reaction/reaction.module';
import { LikeModule } from './like/like.module';
import { ProfileModule } from './profile/profile.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `src/config/.env.${process.env.NODE_ENV ?? 'development'}`,
        'src/config/.env',
      ],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'better-sqlite3',
        database: configService.get('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    PhotosModule,
    ReactionsModule,
    CommentModule,
    LikeModule,
    ProfileModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
