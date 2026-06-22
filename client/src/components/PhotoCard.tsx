import { motion } from 'motion/react';
import { useEffect, useState, type FC } from 'react';
import type { Photo } from '../models/Photo';

interface Props {
  photo: Photo;
  index: number;
}

export const PhotoCard: FC<Props> = ({ photo, index }) => {
  const [aspect, setAspect] = useState<number | null>(null);
  const [borderDone, setBorderDone] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = photo.thumbnailUrl;
    img.onload = () => setAspect(img.naturalWidth / img.naturalHeight);
  }, [photo.thumbnailUrl]);

  return (
    <figure
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
    </figure>
  );
};
