import type { FC, ReactNode } from 'react';
import { useTheme, type Theme } from '../hooks/useTheme';


const Sun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const Moon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

const Monitor = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

const options: { value: Theme; label: string; icon: ReactNode }[] = [
  { value: 'light', label: 'Светлая тема', icon: <Sun /> },
  { value: 'dark', label: 'Тёмная тема', icon: <Moon /> },
  { value: 'system', label: 'Системная тема', icon: <Monitor /> },
];

export const ThemeSwitcher: FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex rounded-xl border border-album-line p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => setTheme(option.value)}
          title={option.label}
          aria-label={option.label}
          className={`flex flex-1 items-center justify-center rounded-lg py-1.5 transition ${
            theme === option.value
              ? 'bg-album-accent text-white'
              : 'text-album-muted hover:text-album-ink'
          }`}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
};
