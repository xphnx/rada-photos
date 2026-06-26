import { useCallback, useEffect, useMemo, useRef, useState, type FC } from "react";

import { useGetPeriodsQuery, useGetPhotosInfiniteQuery } from "../../api/photoApi/photoApi";
import { PeriodFilter, PhotoCard, PhotoModal, Spinner } from "../../components";
import { useColumnCount } from "./useColumnCount";
import type { Photo } from "../../models/Photo";
import { useVisiblePeriod } from "../../hooks/useVisiblePeriod";
import type { PhotoFilter } from "../../models/Period";

export const FeedPage: FC = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [filter, setFilter] = useState<PhotoFilter>({order: 'desc'});
    const [showTop, setShowTop] = useState(false);

    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useGetPhotosInfiniteQuery(filter);

    const [gridRef, columnCount] = useColumnCount();
    const { label, registerCard } = useVisiblePeriod();
    const { data: periods = [] } = useGetPeriodsQuery();

    const isEmpty = (data?.pages.flatMap((p) => p.items).length ?? 0) === 0;

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


    const loadMore = useCallback(() => {
      if (hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    useEffect(() => {
      const el = sentinelRef.current;
      if (!el || !hasNextPage) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) loadMore();
        },
        { rootMargin: '800px' },
      );
      observer.observe(el);
      return () => observer.disconnect();
    }, [hasNextPage, loadMore]);

    useEffect(() => {
      if (activeIndex === null) return;
      if (activeIndex >= photos.length - 5) loadMore();
    }, [activeIndex, photos.length, loadMore]);

    useEffect(() => {
      const onScroll = () => setShowTop(window.scrollY > 600);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll(); 
      return () => window.removeEventListener('scroll', onScroll);
    }, []);

   return (
    <div className="mx-auto max-w-8xl px-4">
      <header className="sticky top-0 z-20 -mx-4 mb-6 flex items-center justify-between border-b border-album-line bg-album-bg/80 px-8 py-4 backdrop-blur">
        <PeriodFilter
          periods={periods}
          value={filter}
          placeholder={label}
          onChange={(next) => setFilter({ ...next, order: filter.order })}
        />

        <button
          onClick={() =>
            setFilter((f) => ({ ...f, order: f.order === 'asc' ? 'desc' : 'asc' }))
          }
          className="rounded-lg border border-album-line bg-album-card px-3 py-2 text-sm text-album-ink transition hover:bg-album-bg"
        >
          {filter.order === 'desc' ? 'Сначала старые' : 'Сначала новые'}
        </button>

      </header>


      {isLoading ? (
        <div className="h-screen overflow-hidden">
          <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="mb-3 animate-pulse rounded-xl bg-album-line/60"
                style={{ height: 140 + ((i * 53) % 180) }}
              />
            ))}
          </div>
        </div>
      ) : isEmpty ? (
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
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Наверх"
          className="fixed bottom-6 right-6 z-30 grid h-12 w-12 place-items-center rounded-full bg-album-accent text-white shadow-lg transition hover:bg-album-accent/90"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}
    </div>
  );
}