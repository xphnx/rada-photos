import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';
import { ReactionsModule } from '../reaction/reaction.module';
import { HiddenPhoto } from './hidden-photo.entity';

@Module({
  imports: [ReactionsModule, TypeOrmModule.forFeature([HiddenPhoto])],
  controllers: [PhotosController],
  providers: [PhotosService],
  exports: [PhotosService],
})
export class PhotosModule {}
