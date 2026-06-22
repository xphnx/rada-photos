import type { FC } from 'react';

interface Props {
  size?: number;
  className?: string;
}

export const Spinner: FC<Props> = ({ size = 24, className = '' }) => (
  <span
    role="status"
    aria-label="Загрузка"
    style={{ width: size, height: size }}
    className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
  />
);
