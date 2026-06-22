export interface DiskSource {
  key: 'main' | 'second';
  label: string;
  token: string;
  path: string;
}

export interface YandexItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  media_type?: string;
  photoslice_time: string;
  modified: string;
}

export interface Photo {
  id: string;
  name: string;
  source: string;
  sourceLabel: string;
  thumbnailUrl: string;
  takenAt: string;
}
