import {
  Controller,
  DefaultValuePipe,
  Get,
  Query,
  Res,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';

import { JwtAuthGuard } from '../auth/jwt.guard';
import { PhotosService } from './photos.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../user/user.entity';
import { Season } from './period';

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
    @CurrentUser() user: User,
  ) {
    return this.photosService.getPage(offset, limit, user.id, season, year);
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
}
