import { motion } from 'motion/react';
import { useEffect, useState, type FC } from 'react';

import type { Photo } from '../models/Photo';
import { useGetReactionSummaryQuery, useToggleLikeMutation } from '../api/reactionApi/reactionApi';

interface Props {
  photo: Photo;
  index: number;
  cardRef?: (el: HTMLElement | null) => void;
  onOpen?: () => void;
}

export const PhotoCard: FC<Props> = ({ photo, index, cardRef, onOpen }) => {
  const [aspect, setAspect] = useState<number | null>(null);
  const [borderDone, setBorderDone] = useState(false);

  const { data: summary } = useGetReactionSummaryQuery(photo.id);
  const [toggleLike] = useToggleLikeMutation();

  const likes = summary?.likeCount ?? 0;
  const liked = summary?.liked ?? false;
  const comments = summary?.commentCount ?? 0;

  const onLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike({ photoId: photo.id });
  };


  useEffect(() => {
    const img = new Image();
    const handleLoad = () => setAspect(img.naturalWidth / img.naturalHeight);

    img.onload = handleLoad;        
    img.src = photo.thumbnailUrl;  

    if (img.complete && img.naturalWidth > 0) {
      handleLoad();
    }
  }, [photo.thumbnailUrl]);

  return (
    <figure
      ref={cardRef}
      onClick={onOpen}
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-album-card"
      style={{ aspectRatio: aspect ?? 3 / 4 }}
    >
      {aspect && (
        <motion.img
          src={photo.thumbnailUrl}
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

    </figure>
  );
};
