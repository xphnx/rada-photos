export interface ProfileMe {
  id: string;
  email: string;
  hasPassword: boolean;
  hasYandex: boolean;
  isAdmin: boolean;
}

export interface ProfileStats {
  likes: number;
  reactions: number;
  comments: number;
}
