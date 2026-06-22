import type { FC } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { useGetMeQuery, useLogoutMutation } from '../api/authApi/authApi';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-xl px-3 py-2 text-sm transition ${
    isActive
      ? 'bg-album-accent text-white'
      : 'text-album-ink hover:bg-album-bg'
  }`;

export const Layout: FC = () => {
  const { data: user } = useGetMeQuery();
  const [logout] = useLogoutMutation();

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col gap-1 border-r border-album-line bg-album-card p-4">
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-album-accent text-white">
            📷
          </span>
          <span className="text-lg font-semibold text-album-ink">
            RadaPhoto
          </span>
        </div>

        <NavLink to="/feed" className={linkClass}>
          Лента
        </NavLink>
        <NavLink to="/cabinet" className={linkClass}>
          Личный кабинет
        </NavLink>

        <div className="mt-auto">
          <p className="mb-2 truncate px-3 text-xs text-album-muted">
            {user?.email}
          </p>
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
