import { useEffect, useState, type FC } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';

import type { Photo } from '../models/Photo';
import { ModalImage } from './ModalImage';

interface Props {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const Chevron: FC<{ dir: 'left' | 'right' }> = ({ dir }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {dir === 'left' ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
  </svg>
);

export const PhotoModal: FC<Props> = ({ photos, index, onClose, onNavigate }) => {
const [direction, setDirection] = useState(0);

  const photo = photos[index];
  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  const goPrev = () => {
    if (!hasPrev) return;
    setDirection(-1);
    onNavigate(index - 1);
    };

  const goNext = () => {
    if (!hasNext) return;
    setDirection(1);
    onNavigate(index + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [index, hasPrev, hasNext]);

  useEffect(() => {
    [index - 1, index + 1].forEach((i) => {
        const neighbor = photos[i];
        if (neighbor) {
        const img = new Image();
        img.src = `${neighbor.thumbnailUrl}&size=XXL`;
        }
    });
  }, [index, photos]);


  if (!photo) return null;

  const date = new Date(photo.takenAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 flex flex-col bg-black/85 md:flex-row"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      
        <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
            <AnimatePresence custom={direction} initial={false}>
                <ModalImage
                    key={photo.id}
                    photo={photo}
                    direction={direction}
                    onClick={(e) => e.stopPropagation()}
                />
            </AnimatePresence>


            {hasPrev && (
                <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
                >
                <Chevron dir="left" />
                </button>
            )}
            {hasNext && (
                <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
                >
                <Chevron dir="right" />
                </button>
            )}
        </div>

      <aside
        onClick={(e) => e.stopPropagation()}
        className="flex h-1/2 w-full flex-col bg-album-bg md:h-full md:w-130"
      >
        <header className="flex items-center justify-between border-b border-album-line p-4">
          <div>
            <p className="font-medium text-album-ink">{photo.sourceLabel}</p>
            <p className="text-sm text-album-muted">{date}</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-album-muted transition hover:bg-album-line/40"
          >
            ✕
          </button>
        </header>

        <div className="border-b border-album-line p-4">
          <p className="text-sm text-album-muted">Описание появится позже.</p>
        </div>

        <div className="border-b border-album-line p-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-album-muted">
            Реакции
          </p>
          <p className="text-sm text-album-muted">Скоро можно будет реагировать.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-album-muted">
            Комментарии
          </p>
          <p className="text-sm text-album-muted">Комментариев пока нет.</p>
        </div>
      </aside>
    </motion.div>,
    document.body,
  );
};
