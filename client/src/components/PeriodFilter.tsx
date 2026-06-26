import { useEffect, useRef, useState, type FC } from 'react';

import type { Period, PhotoFilter, Season } from '../models/Period';

const SEASON_LABELS: Record<Season, string> = {
  winter: 'Зима',
  spring: 'Весна',
  summer: 'Лето',
  autumn: 'Осень',
};

const labelOf = (p: Pick<Period, 'season' | 'year'>) =>
  `${SEASON_LABELS[p.season]} ${p.year}`;

interface Props {
  periods: Period[];
  value: PhotoFilter;
  placeholder: string;
  onChange: (filter: PhotoFilter) => void;
}

export const PeriodFilter: FC<Props> = ({ periods, value, placeholder, onChange }) => {
  const selectedLabel =
    value.season && value.year ? labelOf({ season: value.season, year: value.year }) : '';

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? periods.filter((p) => labelOf(p).toLowerCase().includes(q))
    : periods;

  const select = (filter: PhotoFilter) => {
    onChange(filter);
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative w-65">
      <input
        value={open ? query : selectedLabel}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={`${placeholder ? `${placeholder} - поиск периода` : 'Поиск периода'}`}
        className="w-full rounded-lg border border-album-line bg-album-card px-3 py-2 text-album-ink outline-none transition focus:border-album-accent"
      />

      {open && (
        <ul className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-album-line bg-album-card py-1 shadow-lg">
          <li>
            <button
              onClick={() => select({})}
              className="block w-full px-3 py-2 text-left text-sm text-album-muted transition hover:bg-album-bg"
            >
              Все фото
            </button>
          </li>

          {filtered.map((p) => {
            const active = value.season === p.season && value.year === p.year;
            return (
              <li key={`${p.season}:${p.year}`}>
                <button
                  onClick={() => select({ season: p.season, year: p.year })}
                  className={`block w-full px-3 py-2 text-left text-sm transition hover:bg-album-bg ${
                    active ? 'text-album-accent' : 'text-album-ink'
                  }`}
                >
                  {labelOf(p)}{' '}
                  <span className="text-album-muted">({p.count})</span>
                </button>
              </li>
            );
          })}

          {filtered.length === 0 && (
            <li className="px-3 py-2 text-sm text-album-muted">Ничего не найдено</li>
          )}
        </ul>
      )}
    </div>
  );
};
