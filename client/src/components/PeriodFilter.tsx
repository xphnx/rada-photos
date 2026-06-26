import type { FC } from 'react';
import type { Period, PhotoFilter, Season } from '../models/Period';

const SEASON_LABELS: Record<Season, string> = {
  winter: 'Зима',
  spring: 'Весна',
  summer: 'Лето',
  autumn: 'Осень',
};

const keyOf = (season: Season, year: number) => `${season}:${year}`;

interface Props {
  periods: Period[];
  value: PhotoFilter;
  onChange: (filter: PhotoFilter) => void;
}

export const PeriodFilter: FC<Props> = ({ periods, value, onChange }) => {
  const selected =
    value.season && value.year ? keyOf(value.season, value.year) : '';

  return (
    <select
      value={selected}
      onChange={(e) => {
        if (!e.target.value) {
          onChange({});
          return;
        }
        const [season, year] = e.target.value.split(':');
        onChange({ season: season as Season, year: Number(year) });
      }}
      className="rounded-lg border border-album-line bg-album-card px-3 py-2 text-album-ink outline-none focus:border-album-accent"
    >
      <option value="">Все фото</option>
      {periods.map((p) => (
        <option key={keyOf(p.season, p.year)} value={keyOf(p.season, p.year)}>
          {SEASON_LABELS[p.season]} {p.year} ({p.count})
        </option>
      ))}
    </select>
  );
};
