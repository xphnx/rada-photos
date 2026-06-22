export interface Photo {
  id: string;
  name: string;
  source: string;
  sourceLabel: string;
  thumbnailUrl: string;
}

export interface PhotosPage {
  items: Photo[];
  total: number;
}