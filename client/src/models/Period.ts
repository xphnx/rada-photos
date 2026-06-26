export type Season = 'winter' | 'spring' | 'summer' | 'autumn';

export interface Period {
  season: Season;
  year: number;
  count: number;
}

export interface PhotoFilter {
  season?: Season;
  year?: number;
  order?: 'asc' | 'desc';
}

