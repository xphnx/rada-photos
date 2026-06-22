import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';

import { ReactionsService } from './reaction.service';
import { SummaryDto, ToggleReactionDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../user/user.entity';

@Controller('reactions')
@UseGuards(JwtAuthGuard)
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post('summary')
  summary(@Body() dto: SummaryDto, @CurrentUser() user: User) {
    return this.reactionsService.getSummary(dto.photoIds, user.id);
  }

  @Put('like')
  like(@Body() dto: { photoId: string }, @CurrentUser() user: User) {
    return this.reactionsService.toggleLike(user.id, dto.photoId);
  }

  @Put('reaction')
  reaction(@Body() dto: ToggleReactionDto, @CurrentUser() user: User) {
    return this.reactionsService.toggleReaction(user.id, dto.photoId, dto.type);
  }
}
