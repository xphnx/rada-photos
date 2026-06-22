import { useEffect, useMemo, useRef, useState, type FC } from "react";

import { useGetPhotosInfiniteQuery } from "../../api/photoApi/photoApi";
import { PhotoCard, PhotoModal, Spinner } from "../../components";
import { useColumnCount } from "./useColumnCount";
import type { Photo } from "../../models/Photo";
import { useVisiblePeriod } from "../../hooks/useVisiblePeriod";

export const FeedPage: FC = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useGetPhotosInfiniteQuery();

    const [gridRef, columnCount] = useColumnCount();
    const { label, registerCard } = useVisiblePeriod();

    const {columns, photos } = useMemo(() => {
        const photos = data?.pages.flatMap((page) => page.items) ?? [];
        const columns: { photo: Photo; index: number }[][] = Array.from(
            { length: columnCount },
            () => [],
        );

        photos.forEach((photo, index) => {
            columns[index % columnCount].push({ photo, index });
        });

        return {columns, photos};

    }, [data, columnCount])


    useEffect(() => {
        const el = sentinelRef.current;
        if (!el || !hasNextPage) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !isFetchingNextPage) {
                void fetchNextPage();
            }
            });
        observer.observe(el);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

   return (
    <div className="mx-auto max-w-8xl px-4 pb-16">
      <header className="sticky top-0 z-10 -mx-4 mb-6 flex items-center justify-between border-b border-album-line bg-album-bg/80 px-8 py-4 backdrop-blur">
        <h1 className="font-grotesk text-2xl text-album-ink">
          {label ?? ''}
        </h1>

      </header>

      {isLoading ? (
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="mb-3 animate-pulse rounded-xl bg-album-line/60"
              style={{ height: 120 + ((i * 47) % 160) }}
            />
          ))}
        </div>
      ) : data?.pages.length === 0 ? (
        <p className="text-album-muted">Фотографий пока нет.</p>
      ) : (
        <>
            <div ref={gridRef} className="flex gap-3">
                {columns.map((column, columnIndex) => (
                    <div key={columnIndex} className="flex flex-1 flex-col gap-3">
                    {column.map(({ photo, index }) => (
                        <PhotoCard 
                          key={photo.id} 
                          photo={photo} 
                          index={index} 
                          cardRef={(el) => registerCard(el, photo.takenAt)}
                          onOpen={() => setActiveIndex(index)} />
                    ))}
                    </div>
                ))}
            </div>


          {hasNextPage && <div ref={sentinelRef} className="h-10" />}
          {isFetchingNextPage && (
            <div className="flex justify-center py-6">
              <Spinner className="text-album-muted" />
            </div>
          )}

        </>
      )}
       {activeIndex !== null && (
        <PhotoModal
          photos={photos}
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          onNavigate={setActiveIndex}
        />
      )}
    </div>
  );
}