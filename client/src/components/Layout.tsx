import { useState, type FC } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { useLogoutMutation } from '../api/authApi/authApi';
import { ThemeSwitcher } from './ThemeSwitcher';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-xl px-3 py-2 text-sm transition ${
    isActive ? 'bg-album-accent text-white' : 'text-album-ink hover:bg-album-bg'
  }`;

export const Layout: FC = () => {
  const [logout] = useLogoutMutation();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen md:flex">
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <button
        onClick={() => setOpen(true)}
        aria-label="Открыть меню"
        className="animate-glint fixed left-3 top-[58%] z-20 grid h-12 w-12 place-items-center rounded-full bg-album-accent text-white md:hidden"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col gap-1 border-r border-album-line bg-album-card p-4 transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:sticky md:top-0 md:z-auto md:h-screen md:w-56 md:translate-x-0 lg:w-72`}
      >
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-album-accent text-white">
            📷
          </span>
          <span className="text-lg font-semibold text-album-ink">
            RadaPhoto
          </span>
        </div>

        <NavLink to="/feed" className={linkClass} onClick={() => setOpen(false)}>
          Лента
        </NavLink>
        <NavLink to="/cabinet" className={linkClass} onClick={() => setOpen(false)}>
          Личный кабинет
        </NavLink>

        <div className="mt-auto space-y-3">
          <ThemeSwitcher />
            <button
              onClick={() => logout()}
              className="w-full rounded-xl border border-album-line px-3 py-2 text-sm text-album-ink transition hover:bg-album-bg"
            >
              Выйти
            </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
};
