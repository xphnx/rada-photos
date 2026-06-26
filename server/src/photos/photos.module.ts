import { Module } from '@nestjs/common';

import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';
import { ReactionsModule } from '../reaction/reaction.module';

@Module({
  imports: [ReactionsModule],
  controllers: [PhotosController],
  providers: [PhotosService],
})
export class PhotosModule {}
