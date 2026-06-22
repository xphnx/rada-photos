import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Reaction } from './reaction.entity';
import { Comment } from '../comment/comment.entity';
import { ReactionsController } from './reaction.controller';
import { ReactionsService } from './reaction.service';
import { Like } from '../like/like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reaction, Like, Comment])],
  controllers: [ReactionsController],
  providers: [ReactionsService],
})
export class ReactionsModule {}
