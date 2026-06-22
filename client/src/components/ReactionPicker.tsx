import type { FC } from 'react';

import type { PhotoSummary } from '../api/types';
import { REACTION_EMOJI, REACTION_ORDER } from '../models/Reaction';

interface Props {
  summary?: PhotoSummary;
  onReact: (type: string) => void;
}

export const ReactionPicker: FC<Props> = ({ summary, onReact }) => {
  const myReaction = summary?.myReaction ?? null;
  const present = REACTION_ORDER.filter((t) => (summary?.reactions[t] ?? 0) > 0);

  return (
    <div className="flex items-center gap-2">
      {present.map((type) => {
        const mine = myReaction === type;
        return (
          <button
            key={type}
            disabled={!mine}
            onClick={mine ? () => onReact(type) : undefined}
            className={`flex shrink-0 items-center gap-1 rounded-full border px-4 py-2 text-sm ${
              mine
                ? 'cursor-pointer border-album-accent bg-album-accent/10'
                : 'cursor-default border-album-line'
            }`}
          >
            <span>{REACTION_EMOJI[type]}</span>
            <span className="text-xs text-album-muted">
              {summary?.reactions[type]}
            </span>
          </button>
        );
      })}

      {myReaction === null && (
        <div className="group relative">
          <button
            aria-label="Реакции"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full   text-album-muted transition group-hover:bg-album-bg"
          >
            🙂
          </button>

          <div className="absolute left-1/2 top-full z-20 hidden -translate-x-1/2 flex-col gap-1 rounded-2xl border border-album-line bg-album-card p-2 shadow-lg group-hover:flex">
            {REACTION_ORDER.map((type) => (
              <button
                key={type}
                onClick={() => onReact(type)}
                className="grid h-9 w-9 place-items-center rounded-full text-xl transition hover:scale-125 hover:bg-album-bg"
              >
                {REACTION_EMOJI[type]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
