import type { PhotoFilter } from '../../models/Period';
import { api } from '../baseApi';
import { photosApi } from '../photoApi/photoApi';
import { ApiTagEnum, type PhotoSummary } from '../types';


export const reactionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
  toggleLike: builder.mutation<PhotoSummary, { photoId: string }>({
  query: (body) => ({ url: '/reactions/like', method: 'PUT', body }),
  async onQueryStarted({ photoId }, { dispatch, queryFulfilled, getState }) {
    const entries = photosApi.util
      .selectInvalidatedBy(getState(), [ApiTagEnum.PHOTO])
      .filter((e) => e.endpointName === 'getPhotos');

    const patches = entries.map((e) =>
      dispatch(
        photosApi.util.updateQueryData('getPhotos', e.originalArgs as PhotoFilter, (draft) => {
          for (const page of draft.pages) {
            const photo = page.items.find((p) => p.id === photoId);
            if (!photo) continue;
            if (photo.liked) {
              photo.liked = false;
              photo.likeCount = Math.max(0, photo.likeCount - 1);
            } else {
              photo.liked = true;
              photo.likeCount += 1;
            }
          }
        }),
      ),
    );

    try { await queryFulfilled; } catch { patches.forEach((p) => p.undo()); }
  },
}),


 toggleReaction: builder.mutation<PhotoSummary, { photoId: string; type: string }>({
  query: (body) => ({ url: '/reactions/reaction', method: 'PUT', body }),
  async onQueryStarted({ photoId, type }, { dispatch, queryFulfilled, getState }) {
    const entries = photosApi.util
      .selectInvalidatedBy(getState(), [ApiTagEnum.PHOTO])
      .filter((e) => e.endpointName === 'getPhotos');

    const patches = entries.map((e) =>
      dispatch(
        photosApi.util.updateQueryData('getPhotos', e.originalArgs as PhotoFilter, (draft) => {
          for (const page of draft.pages) {
            const photo = page.items.find((p) => p.id === photoId);
            if (!photo) continue;

            const prev = photo.myReaction;
            // убрать прежнюю реакцию из счётчика
            if (prev) photo.reactions[prev] = Math.max(0, (photo.reactions[prev] ?? 1) - 1);

            if (prev === type) {
              // повторный клик по той же — снимаем
              photo.myReaction = null;
            } else {
              // ставим новую
              photo.reactions[type] = (photo.reactions[type] ?? 0) + 1;
              photo.myReaction = type;
            }
          }
        }),
      ),
    );

    try { await queryFulfilled; } catch { patches.forEach((p) => p.undo()); }
  },
}),

  }),
});

export const {
  useToggleLikeMutation,
  useToggleReactionMutation,
} = reactionsApi;
