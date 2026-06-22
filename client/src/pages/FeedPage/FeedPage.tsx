import { useEffect, useMemo, useRef, type FC } from "react";

import { useGetPhotosInfiniteQuery } from "../../api/authApi/photoApi";
import { PhotoCard } from "../../components";
import { useColumnCount } from "./useColumnCount";
import type { Photo } from "../../models/Photo";

export const FeedPage: FC = () => {
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useGetPhotosInfiniteQuery();

    const columnCount = useColumnCount();

    const columns = useMemo(() => {
        const photos = data?.pages.flatMap((page) => page.items) ?? [];
        const columns: { photo: Photo; index: number }[][] = Array.from(
            { length: columnCount },
            () => [],
        );

        photos.forEach((photo, index) => {
            columns[index % columnCount].push({ photo, index });
        });

        return columns;

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

    if (isLoading) {
        return <div>Загрузка...</div>
    }

   return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <header className="sticky top-0 z-10 -mx-4 mb-6 flex items-center justify-between border-b border-album-line bg-album-bg/80 px-4 py-4 backdrop-blur">
        <h1 className="font-display text-2xl text-album-ink">Наш альбом</h1>
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
            <div className="flex gap-3">
                {columns.map((column, columnIndex) => (
                    <div key={columnIndex} className="flex flex-1 flex-col gap-3">
                    {column.map(({ photo, index }) => (
                        <PhotoCard key={photo.id} photo={photo} index={index} />
                    ))}
                    </div>
                ))}
            </div>


          {hasNextPage && <div ref={sentinelRef} className="h-10" />}
          {isFetchingNextPage && (
            <p className="mt-4 text-center text-album-muted">Загрузка…</p>
          )}
        </>
      )}
    </div>
  );
}