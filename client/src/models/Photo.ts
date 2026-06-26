export interface Photo {
  id: string;
  name: string;
  type: 'image' | 'video';
  videoUrl?: string;
  source: string;
  sourceLabel: string;
  thumbnailUrl: string;
  takenAt: string;
  likeCount: number;
  reactions: Record<string, number>;
  commentCount: number;
  liked: boolean;
  myReaction: string | null;
}