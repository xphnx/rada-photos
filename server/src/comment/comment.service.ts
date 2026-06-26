import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comment } from './comment.entity';
import { User } from '../user/user.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly comments: Repository<Comment>,
  ) {}

  async list(photoId: string, userId: string) {
    const rows = await this.comments.find({
      where: { photoId },
      relations: { user: true },
      order: { createdAt: 'ASC' },
    });

    return rows.map((c) => ({
      id: c.id,
      text: c.text,
      createdAt: c.createdAt,
      author: c.user.email,
      mine: c.user.id === userId,
    }));
  }

  async add(userId: string, photoId: string, text: string) {
    const comment = this.comments.create({
      photoId,
      text,
      user: { id: userId } as User,
    });
    await this.comments.save(comment);
    return { success: true };
  }

  async remove(commentId: string, userId: string, isAdmin: boolean) {
    const comment = await this.comments.findOne({
      where: { id: commentId },
      relations: { user: true },
    });

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    if (comment.user.id !== userId && !isAdmin) {
      throw new ForbiddenException('Можно удалять только свои комментарии');
    }

    await this.comments.remove(comment);
    return { success: true };
  }

  async listByUser(userId: string) {
    const rows = await this.comments.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
    return rows.map((c) => ({
      id: c.id,
      text: c.text,
      createdAt: c.createdAt,
      photoId: c.photoId,
    }));
  }
}
