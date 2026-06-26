import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CommentService } from './comment.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../user/user.entity';
import { AddCommentDto } from './dto';
import { isAdminEmail } from '../auth/admin/admin.util';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  list(@Query('photoId') photoId: string, @CurrentUser() user: User) {
    return this.commentService.list(photoId, user.id);
  }

  @Post()
  add(@Body() dto: AddCommentDto, @CurrentUser() user: User) {
    return this.commentService.add(user.id, dto.photoId, dto.text);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    const isAdmin = isAdminEmail(user.email, this.configService);
    return this.commentService.remove(id, user.id, isAdmin);
  }
}
