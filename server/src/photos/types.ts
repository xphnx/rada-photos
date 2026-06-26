export interface DiskSource {
  key: 'main' | 'second';
  label: string;
  token: string;
  path: string;
}

export interface YandexItem {
  resource_id: string;
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
  thumbnailUrl: string;
  takenAt: string;
  likeCount: number;
  reactions: Record<string, number>;
  commentCount: number;
  liked: boolean;
  myReaction: string | null;
}
