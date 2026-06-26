import { useState, type FC } from "react";
import { motion} from 'motion/react'

import type { Photo } from "../models/Photo";
import { Spinner } from "./Spinner";

export const ModalImage: FC<{ photo: Photo; direction: number; onClick: (e: React.MouseEvent) => void }> = ({
  photo,
  direction,
  onClick,
}) => {
  const [loaded, setLoaded] = useState(false);

    const slideVariants = {
      enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
      center: { opacity: 1, x: 0 },
      exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
    };
  
  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="absolute inset-0 flex items-center justify-center"
    >
      {!loaded && (
        <Spinner
          size={36}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/70"
        />
      )}
      {photo.type === 'video' ? (
        <video
          src={photo.videoUrl}
          poster={`${photo.thumbnailUrl}&size=XXL`}
          controls
          autoPlay
          playsInline
          onClick={onClick}
          onLoadedData={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0 }}
          className="max-h-full max-w-full rounded-lg object-contain transition-opacity duration-300"
        />
      ) : (
        <img
          src={`${photo.thumbnailUrl}&size=XXL`}
          alt={photo.name}
          onClick={onClick}
          onLoad={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0 }}
          className="max-h-full max-w-full rounded-lg object-contain transition-opacity duration-300"
        />
      )}

    </motion.div>
  );
};
