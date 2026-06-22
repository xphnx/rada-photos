import type { Photo } from "../models/Photo";

export enum ApiTagEnum {
    AUTH = 'AUTH',
    PHOTO = 'PHOTO',
    REACTION = 'REACTION',
}

export interface PhotoSummary {
  likeCount: number;
  liked: boolean;
  reactions: Record<string, number>;
  myReaction: string | null;
  commentCount: number;
}

export interface PhotosPage {
  items: Photo[];
  total: number;
}