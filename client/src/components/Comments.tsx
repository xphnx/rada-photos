import { useState, type FC } from 'react';
import { toast } from 'sonner';

import {
  useGetCommentsQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
} from '../api/commentApi/commentApi';
import { Spinner } from './Spinner';

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const sec = (Date.now() - d.getTime()) / 1000;
  if (sec < 60) return 'только что';
  if (sec < 3600) return `${Math.floor(sec / 60)} мин`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} ч`;
  if (sec < 604800) return `${Math.floor(sec / 86400)} дн`;
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
};


export const Comments: FC<{ photoId: string }> = ({ photoId }) => {
  const { data: comments = [], isLoading } = useGetCommentsQuery(photoId);
  const [addComment, { isLoading: adding }] = useAddCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [text, setText] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;

    try {
      await addComment({ photoId, text: value }).unwrap();
      setText('');
    } catch {
      toast.error('Не удалось отправить комментарий');
    }
  };

  return (
    <div className="flex h-full flex-col">
      <p className="mb-3 text-xs uppercase tracking-wide text-album-muted">
        Комментарии
      </p>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {isLoading ? (
          <Spinner className="text-album-muted" />
        ) : comments.length === 0 ? (
          <p className="text-sm text-album-muted">Комментариев пока нет.</p>
        ) : (
          comments.map((c) => {
            const name = c.author.split('@')[0];
            return (
                <div key={c.id} className="group flex gap-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-album-accent/15 text-sm font-semibold uppercase text-album-accent">
                        {name[0]}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="relative rounded-2xl rounded-tl-sm border border-album-line bg-album-card px-3 py-2">
                            <div className="mb-0.5 flex items-baseline justify-between gap-2">
                                <span className="truncate text-xs font-semibold tracking-wide text-album-accent">
                                {name}
                                </span>
                                <span className="shrink-0 text-[11px] text-album-muted">
                                {formatTime(c.createdAt)}
                                </span>
                            </div>

                            <p className="break-words text-sm leading-relaxed text-album-ink">
                                {c.text}
                            </p>

                            {c.mine && (
                                <button
                                onClick={() => deleteComment({ id: c.id, photoId })}
                                className="absolute bottom-1 right-2 rounded bg-album-card pl-2 text-xs text-album-muted opacity-0 transition hover:text-red-600 group-hover:opacity-100"
                                >
                                Удалить
                                </button>
                            )}
                            </div>

                    </div>
                </div>
            );
            })

        )}
      </div>

      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Написать комментарий…"
          className="flex-1 rounded-xl border border-album-line bg-album-card px-3 py-2 text-sm text-album-ink outline-none transition focus:border-album-accent"
        />
        <button
          type="submit"
          disabled={adding || !text.trim()}
          className="rounded-xl bg-album-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-album-accent/90 disabled:opacity-50"
        >
          Отправить
        </button>
      </form>
    </div>
  );
};
