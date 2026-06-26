import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Interval } from '@nestjs/schedule';
import { DiskSource, Photo, YandexItem } from './types';
import { YANDEX_DISK } from '../config/config.constants';
import { ReactionsService } from '../reaction/reaction.service';
import { periodOf, Season } from './period';
import { InjectRepository } from '@nestjs/typeorm';
import { HiddenPhoto } from './hidden-photo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PhotosService implements OnModuleInit {
  private readonly sources: DiskSource[];

  private cache: Photo[] = [];
  private photoMeta = new Map<
    string,
    { sourceKey: DiskSource['key']; path: string }
  >();
  private building: Promise<Photo[]> | null = null;
  private revisions: Record<string, number> = {};
  private readonly photoFolders = [
    'disk:/Photos',
    'disk:/Фотокамера',
    'disk:/Фотки',
  ];
  private hidden = new Set<string>();
  private ready = false;

  constructor(
    configService: ConfigService,
    private readonly reactionsService: ReactionsService,
    @InjectRepository(HiddenPhoto)
    private readonly hiddenRepo: Repository<HiddenPhoto>,
  ) {
    this.sources = [
      {
        key: 'main',
        label: 'Шамиль',
        token: configService.getOrThrow<string>(YANDEX_DISK.MAIN_TOKEN),
        path: configService.get<string>(YANDEX_DISK.MAIN_PATH) ?? '/',
      },
      {
        key: 'second',
        label: 'Катя',
        token: configService.getOrThrow<string>(YANDEX_DISK.SECOND_TOKEN),
        path: configService.get<string>(YANDEX_DISK.SECOND_PATH) ?? '/',
      },
    ];
  }

  private async buildAllPhotos(): Promise<Photo[]> {
    this.photoMeta.clear();
    const results = await Promise.allSettled(
      this.sources.map((source) => this.listFromSource(source)),
    );

    return results
      .filter((r) => r.status === 'fulfilled')
      .flatMap((r) => r.value)
      .sort((a, b) => b.takenAt.localeCompare(a.takenAt));
  }

  private async refresh(): Promise<Photo[]> {
    if (!this.building) {
      this.building = this.buildAllPhotos().finally(() => {
        this.building = null;
      });
    }
    this.cache = await this.building;
    this.ready = true;
    return this.cache;
  }

  private async hasChanges(): Promise<boolean> {
    let changed = false;

    for (const source of this.sources) {
      const info = await this.yandexGet<{ revision: number }>(
        source.token,
        '',
        {},
      );

      if (info.revision !== this.revisions[source.key]) {
        this.revisions[source.key] = info.revision;
        changed = true;
      }
    }

    return changed;
  }

  private async listFolder(
    source: DiskSource,
    path: string,
    photos: Photo[],
  ): Promise<void> {
    const limit = 1000;
    let offset = 0;

    while (true) {
      let data: { _embedded?: { items: YandexItem[] } };
      try {
        data = await this.yandexGet<{ _embedded?: { items: YandexItem[] } }>(
          source.token,
          '/resources',
          { path, limit: String(limit), offset: String(offset) },
        );
      } catch {
        return;
      }

      const items = data._embedded?.items ?? [];
      if (items.length === 0) break;

      for (const item of items) {
        if (item.type === 'dir') {
          await this.listFolder(source, item.path, photos);
          continue;
        }

        if (item.media_type !== 'image' && item.media_type !== 'video') {
          continue;
        }

        const isVideo = item.media_type === 'video';

        this.photoMeta.set(item.resource_id, {
          sourceKey: source.key,
          path: item.path,
        });

        photos.push({
          id: item.resource_id,
          name: item.name,
          type: isVideo ? 'video' : 'image',
          thumbnailUrl: `/api/photos/thumbnail?source=${source.key}&path=${encodeURIComponent(item.path)}`,
          videoUrl: isVideo
            ? `/api/photos/video?source=${source.key}&path=${encodeURIComponent(item.path)}`
            : undefined,
          takenAt: item.photoslice_time ?? item.modified ?? '',
          likeCount: 0,
          reactions: {},
          commentCount: 0,
          liked: false,
          myReaction: null,
        });
      }

      offset += limit;
      if (items.length < limit) break;
    }
  }

  private async listFromSource(source: DiskSource): Promise<Photo[]> {
    const photos: Photo[] = [];

    for (const folder of this.photoFolders) {
      await this.listFolder(source, folder, photos);
    }

    return photos;
  }

  private getSource(key: string): DiskSource {
    const source = this.sources.find((s) => s.key === key);

    if (!source) {
      throw new InternalServerErrorException(`Неизвестный источник: ${key}`);
    }

    return source;
  }

  private async yandexGet<T>(
    token: string,
    endpoint: string,
    params: Record<string, string>,
  ): Promise<T> {
    const url = new URL(`${YANDEX_DISK.API}${endpoint}`);

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });

    const response = await fetch(url, {
      headers: { Authorization: `OAuth ${token}` },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new InternalServerErrorException(
        `Yandex Disk API ${response.status}: ${body}`,
      );
    }

    return response.json() as Promise<T>;
  }

  private async yandexDelete(token: string, path: string): Promise<void> {
    const url = new URL(`${YANDEX_DISK.API}/resources`);
    url.searchParams.set('path', path);
    url.searchParams.set('permanently', 'true');

    const response = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `OAuth ${token}` },
    });

    if (![200, 202, 204].includes(response.status)) {
      const body = await response.text();
      throw new InternalServerErrorException(
        `Yandex Disk DELETE ${response.status}: ${body}`,
      );
    }
  }

  private async ensureReady(): Promise<void> {
    if (this.ready) return;
    await this.refresh();
  }

  async onModuleInit() {
    await this.loadHidden();
    void this.refresh().catch((error) =>
      console.error('Не удалось собрать ленту:', error),
    );
  }

  private async loadHidden() {
    const rows = await this.hiddenRepo.find();
    this.hidden = new Set(rows.map((r) => r.photoId));
  }

  @Interval(5 * 60 * 1000)
  async scheduledRefresh() {
    try {
      const changed = await this.hasChanges();
      if (changed) {
        await this.refresh();
      }
    } catch (error) {
      console.error('Обновление ленты упало:', error);
    }
  }

  async hidePhoto(id: string, userId: string) {
    if (!this.hidden.has(id)) {
      await this.hiddenRepo.save({ photoId: id, hiddenBy: userId });
      this.hidden.add(id);
    }
    return { success: true };
  }

  async unhidePhoto(id: string) {
    await this.hiddenRepo.delete({ photoId: id });
    this.hidden.delete(id);
    return { success: true };
  }

  async getPage(
    offset: number,
    limit: number,
    userId: string,
    season?: Season,
    year?: number,
    order: 'asc' | 'desc' = 'desc',
  ) {
    await this.ensureReady();

    const visible = this.cache.filter((p) => !this.hidden.has(p.id));
    const source =
      season && year
        ? visible.filter((p) => {
            const period = periodOf(p.takenAt);
            return period?.season === season && period.year === year;
          })
        : visible;

    const ordered = order === 'asc' ? [...source].reverse() : source;

    const slice = ordered.slice(offset, offset + limit);
    const ids = slice.map((p) => p.id);
    const summary = await this.reactionsService.getSummary(ids, userId);

    return {
      items: slice.map((p) => ({ ...p, ...summary[p.id] })),
      total: source.length,
    };
  }

  async getThumbnail(sourceKey: string, path: string, size = 'L') {
    const source = this.getSource(sourceKey);

    const meta = await this.yandexGet<{ preview?: string }>(
      source.token,
      '/resources',
      {
        path,
        preview_size: size,
        fields: 'preview',
      },
    );

    if (!meta.preview) {
      throw new InternalServerErrorException('У файла нет превью');
    }

    const imageResponse = await fetch(meta.preview, {
      headers: { Authorization: `OAuth ${source.token}` },
    });

    const contentType =
      imageResponse.headers.get('content-type') ?? 'image/jpeg';
    const buffer = Buffer.from(await imageResponse.arrayBuffer());

    return { buffer, contentType };
  }

  async availablePeriods() {
    await this.ensureReady();
    const map = new Map<
      string,
      { season: Season; year: number; count: number }
    >();

    for (const p of this.cache) {
      if (this.hidden.has(p.id)) continue;
      const period = periodOf(p.takenAt);
      if (!period) continue;

      const key = `${period.year}-${period.season}`;
      const entry = map.get(key);
      if (entry) entry.count += 1;
      else map.set(key, { ...period, count: 1 });
    }

    const order: Season[] = ['winter', 'spring', 'summer', 'autumn'];
    return [...map.values()].sort(
      (a, b) =>
        b.year - a.year || order.indexOf(b.season) - order.indexOf(a.season),
    );
  }

  async getPhotosByIds(ids: string[], userId: string) {
    await this.ensureReady();
    if (ids.length === 0) return [];

    const idSet = new Set(ids);
    const found = this.cache.filter(
      (p) => idSet.has(p.id) && !this.hidden.has(p.id),
    );

    const summary = await this.reactionsService.getSummary(
      found.map((p) => p.id),
      userId,
    );

    return found.map((p) => ({ ...p, ...summary[p.id] }));
  }

  async deletePhoto(id: string): Promise<{ success: boolean }> {
    const meta = this.photoMeta.get(id);

    if (!meta) {
      throw new NotFoundException('Фото не найдено');
    }

    const source = this.getSource(meta.sourceKey);
    await this.yandexDelete(source.token, meta.path);

    this.cache = this.cache.filter((p) => p.id !== id);
    this.photoMeta.delete(id);

    return { success: true };
  }

  async getVideoHref(sourceKey: string, path: string): Promise<string> {
    const source = this.getSource(sourceKey);

    const data = await this.yandexGet<{ href: string }>(
      source.token,
      '/resources/download',
      { path },
    );

    return data.href;
  }
}
