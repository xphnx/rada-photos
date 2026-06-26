import type { Photo } from "./Photo";

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  author: string;
  mine: boolean;
}

export interface MyComment {
  id: string;
  text: string;
  createdAt: string;
  photoId: string;
  photo: Photo;
}