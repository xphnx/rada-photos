import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../user/user.entity';
import { ReactionsService } from '../reaction/reaction.service';
import { PhotosService } from '../photos/photos.service';
import { CommentService } from '../comment/comment.service';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly reactionsService: ReactionsService,
    private readonly photosService: PhotosService,
    private readonly commentService: CommentService,
  ) {}

  @Get('stats')
  stats(@CurrentUser() user: User) {
    return this.reactionsService.getUserStats(user.id);
  }

  @Get('likes')
  async likes(@CurrentUser() user: User) {
    const ids = await this.reactionsService.getLikedPhotoIds(user.id);
    return this.photosService.getPhotosByIds(ids, user.id);
  }

  @Get('reactions')
  async reactions(@CurrentUser() user: User) {
    const ids = await this.reactionsService.getReactedPhotoIds(user.id);

    return this.photosService.getPhotosByIds(ids, user.id);
  }

  @Get('comments')
  async comments(@CurrentUser() user: User) {
    const rows = await this.commentService.listByUser(user.id);

    const photos = await this.photosService.getPhotosByIds(
      rows.map((r) => r.photoId),
      user.id,
    );

    const byId = new Map(photos.map((p) => [p.id, p]));

    return rows
      .map((r) => ({ ...r, photo: byId.get(r.photoId) ?? null }))
      .filter((r) => r.photo);
  }
}
