import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Interval } from '@nestjs/schedule';
import { DiskSource, Photo, YandexItem } from './types';
import { YANDEX_DISK } from '../config/config.constants';
import { ReactionsService } from '../reaction/reaction.service';
import { periodOf, Season } from './period';

@Injectable()
export class PhotosService implements OnModuleInit {
  private readonly sources: DiskSource[];

  private cache: Photo[] = [];
  private cacheExpiresAt = 0;
  private building: Promise<Photo[]> | null = null;
  private readonly cacheTtlMs = 5 * 60 * 1000;
  private revisions: Record<string, number> = {};
  private readonly allowedFolders = ['disk:/Фотокамера/', 'disk:/Photos/'];

  constructor(
    configService: ConfigService,
    private readonly reactionsService: ReactionsService,
  ) {
    this.sources = [
      {
        key: 'main',
        label: 'Шамиль',
        token: configService.getOrThrow<string>(YANDEX_DISK.MAIN_TOKEN),
        path: configService.get<string>(YANDEX_DISK.MAIN_PATH) ?? '/',
      },
      // {
      //   key: 'second',
      //   label: 'Катя',
      //   token: configService.getOrThrow<string>(YANDEX_DISK.SECOND_TOKEN),
      //   path: configService.get<string>(YANDEX_DISK.SECOND_PATH) ?? '/',
      // },
    ];
  }

  private async getAllPhotos(): Promise<Photo[] | null> {
    if (this.cache.length && Date.now() < this.cacheExpiresAt) {
      return this.cache;
    }

    if (!this.building) {
      this.building = this.buildAllPhotos().finally(() => {
        this.building = null;
      });
    }

    const photos = await this.building;
    this.cache = photos;
    this.cacheExpiresAt = Date.now() + this.cacheTtlMs;

    return photos;
  }

  private async buildAllPhotos(): Promise<Photo[]> {
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

  private async listFromSource(source: DiskSource): Promise<Photo[]> {
    const limit = 1000;
    let offset = 0;
    const photos: Photo[] = [];

    try {
      while (true) {
        const data = await this.yandexGet<{ items: YandexItem[] }>(
          source.token,
          '/resources/files',
          {
            media_type: 'image',
            limit: String(limit),
            offset: String(offset),
            path: 'disk:/',
          },
        );

        const items =
          data.items.filter(
            (item) =>
              item.path.startsWith('disk:/Photos') ||
              item.path.startsWith('disk:/Фотокамера'),
          ) ?? [];

        if (items.length === 0) {
          break;
        }

        photos.push(
          ...items.map((item) => ({
            id: item.resource_id,
            name: item.name,
            thumbnailUrl: `/api/photos/thumbnail?source=${source.key}&path=${encodeURIComponent(item.path)}`,
            takenAt: item.photoslice_time ?? item.modified ?? '',
            likeCount: 0,
            reactions: {},
            commentCount: 0,
            liked: false,
            myReaction: null,
          })),
        );

        offset += limit;
      }

      return photos;
    } catch (error) {
      console.error('Ошибка построения ленты', error);

      return [];
    }
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

  onModuleInit() {
    void this.refresh().catch((error) =>
      console.error('Не удалось собрать ленту:', error),
    );
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

  async getPage(
    offset: number,
    limit: number,
    userId: string,
    season?: Season,
    year?: number,
  ) {
    const source =
      season && year
        ? this.cache.filter((p) => {
            const period = periodOf(p.takenAt);
            return period?.season === season && period.year === year;
          })
        : this.cache;

    const slice = source.slice(offset, offset + limit);
    const ids = slice.map((p) => p.id);

    const summary = await this.reactionsService.getSummary(ids, userId);

    const items = slice.map((p) => ({ ...p, ...summary[p.id] }));

    return { items, total: source.length };
  }

  async listPhotos(): Promise<Photo[]> {
    const results = await Promise.allSettled(
      this.sources.map((source) => this.listFromSource(source)),
    );

    return results
      .filter((r) => r.status === 'fulfilled')
      .flatMap((r) => r.value);
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
  availablePeriods() {
    const map = new Map<
      string,
      { season: Season; year: number; count: number }
    >();

    for (const p of this.cache) {
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
}
