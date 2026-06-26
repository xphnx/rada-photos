import { Module } from '@nestjs/common';

import { ProfileController } from './profile.controller';
import { ReactionsModule } from '../reaction/reaction.module';
import { PhotosModule } from '../photos/photos.module';
import { CommentModule } from '../comment/comment.module';

@Module({
  imports: [ReactionsModule, PhotosModule, CommentModule],
  controllers: [ProfileController],
})
export class ProfileModule {}
