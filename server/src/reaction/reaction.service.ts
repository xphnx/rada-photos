import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Reaction } from './reaction.entity';
import { Comment } from '../comment/comment.entity';
import { User } from '../user/user.entity';
import { Like } from '../like/like.entity';

export interface PhotoSummary {
  likeCount: number;
  liked: boolean;
  reactions: Record<string, number>;
  myReaction: string | null;
  commentCount: number;
}

@Injectable()
export class ReactionsService {
  constructor(
    @InjectRepository(Reaction)
    private readonly reactions: Repository<Reaction>,
    @InjectRepository(Like) private readonly likes: Repository<Like>,
    @InjectRepository(Comment) private readonly comments: Repository<Comment>,
  ) {}

  async toggleLike(userId: string, photoId: string) {
    const existing = await this.likes.findOne({
      where: { photoId, user: { id: userId } },
    });

    if (existing) {
      await this.likes.remove(existing);
    } else {
      await this.likes.save(
        this.likes.create({ photoId, user: { id: userId } as User }),
      );
    }

    return (await this.getSummary([photoId], userId))[photoId];
  }

  async toggleReaction(userId: string, photoId: string, type: string) {
    const existing = await this.reactions.findOne({
      where: { photoId, user: { id: userId } },
    });

    if (existing) {
      if (existing.type === type) await this.reactions.remove(existing);
      else {
        existing.type = type;
        await this.reactions.save(existing);
      }
    } else {
      await this.reactions.save(
        this.reactions.create({ photoId, type, user: { id: userId } as User }),
      );
    }

    return (await this.getSummary([photoId], userId))[photoId];
  }

  async getSummary(photoIds: string[], userId: string) {
    const result: Record<string, PhotoSummary> = {};
    photoIds.forEach((id) => {
      result[id] = {
        likeCount: 0,
        liked: false,
        reactions: {},
        myReaction: null,
        commentCount: 0,
      };
    });
    if (photoIds.length === 0) return result;

    const likeRows = await this.likes
      .createQueryBuilder('l')
      .select('l.photoId', 'photoId')
      .addSelect('l.userId', 'userId')
      .where('l.photoId IN (:...ids)', { ids: photoIds })
      .getRawMany<{ photoId: string; userId: string }>();

    likeRows.forEach((row) => {
      const entry = result[row.photoId];
      if (!entry) return;
      entry.likeCount += 1;
      if (row.userId === userId) entry.liked = true;
    });

    const reactionRows = await this.reactions
      .createQueryBuilder('r')
      .select('r.photoId', 'photoId')
      .addSelect('r.type', 'type')
      .addSelect('r.userId', 'userId')
      .where('r.photoId IN (:...ids)', { ids: photoIds })
      .getRawMany<{ photoId: string; type: string; userId: string }>();

    reactionRows.forEach((row) => {
      const entry = result[row.photoId];
      if (!entry) return;
      entry.reactions[row.type] = (entry.reactions[row.type] ?? 0) + 1;
      if (row.userId === userId) entry.myReaction = row.type;
    });

    const commentRows = await this.comments
      .createQueryBuilder('c')
      .select('c.photoId', 'photoId')
      .addSelect('COUNT(*)', 'count')
      .where('c.photoId IN (:...ids)', { ids: photoIds })
      .groupBy('c.photoId')
      .getRawMany<{ photoId: string; count: string }>();

    commentRows.forEach((row) => {
      if (result[row.photoId])
        result[row.photoId].commentCount = Number(row.count);
    });

    return result;
  }
}
