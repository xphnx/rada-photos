export type Season = 'winter' | 'spring' | 'summer' | 'autumn';

export interface Period {
  season: Season;
  year: number;
}

export function periodOf(takenAt: string): Period | null {
  const date = new Date(takenAt);
  if (Number.isNaN(date.getTime())) return null;

  const month = date.getMonth();
  let year = date.getFullYear();
  let season: Season;

  if (month === 11) {
    season = 'winter';
    year += 1;
  } else if (month <= 1) season = 'winter';
  else if (month <= 4) season = 'spring';
  else if (month <= 7) season = 'summer';
  else season = 'autumn';

  return { season, year };
}
