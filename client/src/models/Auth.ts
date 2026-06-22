export interface User {
  id: string;
  email: string;
  yandexId: string | null;
}

export interface Credentials {
  email: string;
  password: string;
}