import {
  Controller,
  DefaultValuePipe,
  Get,
  Query,
  Res,
  ParseIntPipe,
  UseGuards,
  Delete,
  Param,
  Put,
} from '@nestjs/common';
import type { Response } from 'express';

import { JwtAuthGuard } from '../auth/jwt.guard';
import { PhotosService } from './photos.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../user/user.entity';
import { Season } from './period';
import { AdminGuard } from '../auth/admin/admin.guard';

@Controller('photos')
@UseGuards(JwtAuthGuard)
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Get()
  list(
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('season') season: Season | undefined,
    @Query('year', new ParseIntPipe({ optional: true }))
    year: number | undefined,
    @Query('order') order: 'asc' | 'desc' | undefined,
    @CurrentUser() user: User,
  ) {
    return this.photosService.getPage(
      offset,
      limit,
      user.id,
      season,
      year,
      order,
    );
  }

  @Get('thumbnail')
  async thumbnail(
    @Query('source') source: string,
    @Query('path') path: string,
    @Query('size') size: string | undefined,
    @Res() response: Response,
  ) {
    const { buffer, contentType } = await this.photosService.getThumbnail(
      source,
      path,
      size,
    );

    response.setHeader('Content-Type', contentType);
    response.setHeader('Cache-Control', 'private, max-age=3600');
    response.send(buffer);
  }

  @Get('periods')
  periods() {
    return this.photosService.availablePeriods();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.photosService.deletePhoto(id);
  }

  @Put(':id/hide')
  @UseGuards(JwtAuthGuard, AdminGuard)
  hide(@Param('id') id: string, @CurrentUser() user: User) {
    return this.photosService.hidePhoto(id, user.id);
  }

  @Put(':id/unhide')
  @UseGuards(JwtAuthGuard, AdminGuard)
  unhide(@Param('id') id: string) {
    return this.photosService.unhidePhoto(id);
  }

  @Get('video')
  async video(
    @Query('source') source: string,
    @Query('path') path: string,
    @Res() response: Response,
  ) {
    const href = await this.photosService.getVideoHref(source, path);

    response.redirect(href);
  }
}
