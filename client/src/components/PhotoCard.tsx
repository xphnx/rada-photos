import { motion } from 'motion/react';
import { useEffect, useState, type FC } from 'react';
import { toast } from 'sonner';

import type { Photo } from '../models/Photo';
import { useToggleLikeMutation } from '../api/reactionApi/reactionApi';
import { useGetMeQuery } from '../api/authApi/authApi';
import { useDeletePhotoMutation, useHidePhotoMutation } from '../api/photoApi/photoApi';

interface Props {
  photo: Photo;
  index: number;
  cardRef?: (el: HTMLElement | null) => void;
  onOpen?: () => void;
}

export const PhotoCard: FC<Props> = ({ photo, index, cardRef, onOpen }) => {
  const [aspect, setAspect] = useState<number | null>(null);
  const [borderDone, setBorderDone] = useState(false);

  const [toggleLike] = useToggleLikeMutation();
  const { data: me } = useGetMeQuery();
  const [deletePhoto] = useDeletePhotoMutation();
  const [hidePhoto] = useHidePhotoMutation();


  const likes = photo?.likeCount ?? 0;
  const liked = photo?.liked ?? false;
  const comments = photo?.commentCount ?? 0;
  const thumbUrl = `${photo.thumbnailUrl}&size=M`;


  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.error(`Удалить «${photo.name}»?`, {
      description: 'Файл будет удалён с Яндекс.Диска навсегда.',
      duration: 8000,
      action: {
        label: 'Удалить',
        onClick: () => deletePhoto({ photoId: photo.id }),
      },
      cancel: {
        label: 'Отмена',
        onClick: () => {},
      },
    });
  };

  const onLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike({ photoId: photo.id });
  };

  const onHide = (e: React.MouseEvent) => {
    e.stopPropagation();
    hidePhoto({ photoId: photo.id });
    toast.info('Фото скрыто из ленты');
  };


  useEffect(() => {
    const img = new Image();
    const handleLoad = () => setAspect(img.naturalWidth / img.naturalHeight);

    img.onload = handleLoad;        
    img.src = thumbUrl;  

    if (img.complete && img.naturalWidth > 0) {
      handleLoad();
    }
  }, [thumbUrl]);

  return (
    <figure
      ref={cardRef}
      onClick={onOpen}
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-album-card"
      style={{ aspectRatio: aspect ?? 3 / 4 }}
    >
      {photo.type === 'video' && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {aspect && (
        <motion.img
          src={thumbUrl}
          alt={photo.name}
          className="h-full w-full object-cover transition duration-300 group-hover:brightness-90"
          initial={{ opacity: 0 }}
          animate={{ opacity: borderDone ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {aspect && !borderDone && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <motion.rect
            x="1"
            y="1"
            width="98"
            height="98"
            rx="3"
            fill="none"
            stroke="var(--color-album-accent)"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 0.8,
              ease: 'easeInOut',
              delay: (index % 12) * 0.05,
            }}
            onAnimationComplete={() => setBorderDone(true)}
          />
        </svg>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/55 to-transparent p-2 pt-8 text-white">
        <button
          onClick={onLike}
          className="pointer-events-auto flex items-center gap-1 text-sm font-medium drop-shadow"
        >
          <svg width="20" height="20" viewBox="0 0 24 24"
            fill={liked ? '#f43f5e' : 'none'}
            stroke={liked ? '#f43f5e' : 'currentColor'} strokeWidth="2">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
          {likes}
        </button>

        <span className="flex items-center gap-1 text-sm font-medium drop-shadow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4L3 21l1.1-3.3A8.4 8.4 0 1 1 21 11.5z" />
          </svg>
          {comments}
        </span>
      </div>

      {me?.isAdmin && (
        <div className="pointer-events-auto absolute right-2 top-2 z-10 hidden gap-1 group-hover:flex">
          <button
            onClick={onHide}
            aria-label="Скрыть из ленты"
            className="grid h-8 w-8 place-items-center rounded-full bg-black/55 text-white transition hover:bg-album-accent"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
              <path d="M10.73 5.08A10.4 10.4 0 0 1 12 5c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <path d="M6.61 6.61A18.5 18.5 0 0 0 1 12s4 8 11 8a10.4 10.4 0 0 0 5.39-1.61" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
          </button>

          <button
            onClick={onDelete}
            aria-label="Удалить фото"
            className="grid h-8 w-8 place-items-center rounded-full bg-black/55 text-white transition hover:bg-red-600"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      )}

    </figure>
  );
};
