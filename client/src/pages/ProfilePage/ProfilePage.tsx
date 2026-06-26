import { useState, type FC, type ReactNode } from 'react';

import { useGetMeQuery } from '../../api/authApi/authApi';
import {
  useGetStatsQuery,
  useGetMyLikesQuery,
  useGetMyReactionsQuery,
  useGetMyCommentsQuery,
} from '../../api/profileApi/profileApi';
import { PhotoCard, PhotoModal, Spinner } from '../../components';
import type { Photo } from '../../models/Photo';
import { REACTION_EMOJI } from '../../models/Reaction';

type Tab = 'likes' | 'reactions' | 'comments';

const Badge: FC<{ children: ReactNode; muted?: boolean }> = ({ children, muted }) => (
  <span
    className={`rounded-full px-3 py-1 text-xs ${
      muted ? 'border border-album-line text-album-muted' : 'bg-album-accent/10 text-album-accent'
    }`}
  >
    {children}
  </span>
);

const TabButton: FC<{
  label: string;
  value?: number;
  active: boolean;
  onClick: () => void;
}> = ({ label, value, active, onClick }) => (
  <button
    onClick={onClick}
    className={`rounded-2xl border p-4 text-center transition ${
      active
        ? 'border-album-accent bg-album-accent/10'
        : 'border-album-line bg-album-card hover:bg-album-bg'
    }`}
  >
    <div className="text-2xl font-semibold text-album-ink">{value ?? 0}</div>
    <div className={`text-sm ${active ? 'text-album-accent' : 'text-album-muted'}`}>
      {label}
    </div>
  </button>
);

const PhotoGrid: FC<{
  photos: Photo[];
  onOpen: (i: number) => void;
  showReaction?: boolean;
}> = ({ photos, onOpen, showReaction }) => (
  <div className="columns-3 gap-2 sm:columns-4 md:columns-5 lg:columns-6">
    {photos.map((photo, index) => (
      <div key={photo.id} className="relative mb-2 break-inside-avoid">
        <PhotoCard photo={photo} index={index} onOpen={() => onOpen(index)} />
        {showReaction && photo.myReaction && (
          <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-base">
            {REACTION_EMOJI[photo.myReaction]}
          </span>
        )}
      </div>
    ))}
  </div>
);


export const ProfilePage: FC = () => {
  const { data: me } = useGetMeQuery();
  const { data: stats } = useGetStatsQuery();
  const { data: likes = [], isLoading: likesLoading } = useGetMyLikesQuery();

  const { data: reactions = [], isLoading: reactionsLoading } = useGetMyReactionsQuery();
  const { data: comments = [], isLoading: commentsLoading } = useGetMyCommentsQuery();

  const [tab, setTab] = useState<Tab>('likes');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const initial = me?.email?.[0]?.toUpperCase() ?? '?';

  const modalPhotos: Photo[] =
    tab === 'likes' ? likes : tab === 'reactions' ? reactions : comments.map((c) => c.photo);

  const switchTab = (next: Tab) => {
    setTab(next);
    setActiveIndex(null); 
  };

  const emptyText: Record<Tab, string> = {
    likes: 'Вы ещё ничего не лайкнули.',
    reactions: 'Вы ещё не ставили реакций.',
    comments: 'Вы ещё не оставляли комментариев.',
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="flex items-center gap-4 border-b border-album-line pb-6">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-album-accent text-2xl font-semibold text-white">
          {initial}
        </div>
        <div>
          <p className="text-lg font-semibold text-album-ink">{me?.email}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {me?.hasPassword && <Badge>Email ✓</Badge>}
            {me?.hasYandex ? <Badge>Яндекс ✓</Badge> : <Badge muted>Яндекс не подключён</Badge>}
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <TabButton label="Лайки" value={stats?.likes} active={tab === 'likes'} onClick={() => switchTab('likes')} />
        <TabButton label="Реакции" value={stats?.reactions} active={tab === 'reactions'} onClick={() => switchTab('reactions')} />
        <TabButton label="Комментарии" value={stats?.comments} active={tab === 'comments'} onClick={() => switchTab('comments')} />
      </section>

      <section className="mt-8">
        {tab === 'comments' ? (
          commentsLoading ? (
            <div className="flex justify-center py-10"><Spinner className="text-album-muted" /></div>
          ) : comments.length === 0 ? (
            <p className="text-album-muted">{emptyText.comments}</p>
          ) : (
            <div className="space-y-3">
              {comments.map((c, index) => (
                <button
                  key={c.id}
                  onClick={() => setActiveIndex(index)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-album-line bg-album-card p-3 text-left transition hover:bg-album-bg"
                >
                  <img
                    src={`${c.photo.thumbnailUrl}&size=M`}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm text-album-ink">{c.text}</p>
                    <p className="mt-1 text-xs text-album-muted">
                      {new Date(c.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )
        ) : tab === 'reactions' ? (
          reactionsLoading ? (
            <div className="flex justify-center py-10"><Spinner className="text-album-muted" /></div>
          ) : reactions.length === 0 ? (
            <p className="text-album-muted">{emptyText.reactions}</p>
          ) : (
            <PhotoGrid photos={reactions} onOpen={setActiveIndex} showReaction />
          )
        ) : likesLoading ? (
          <div className="flex justify-center py-10"><Spinner className="text-album-muted" /></div>
        ) : likes.length === 0 ? (
          <p className="text-album-muted">{emptyText.likes}</p>
        ) : (
          <PhotoGrid photos={likes} onOpen={setActiveIndex} />
        )}
      </section>

      {activeIndex !== null && modalPhotos[activeIndex] && (
        <PhotoModal
          photos={modalPhotos}
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          onNavigate={setActiveIndex}
        />
      )}
    </div>
  );
};
