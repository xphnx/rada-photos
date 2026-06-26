import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

import { api } from '../baseApi';
import { ApiTagEnum, type PhotosPage } from '../types';
import type { Period, PhotoFilter } from '../../models/Period';


function removeFromFeed(
  photoId: string,
  dispatch: ThunkDispatch<any, any, UnknownAction>,
  getState: () => unknown,
) {
  return photosApi.util
    .selectInvalidatedBy(getState() as any, [ApiTagEnum.PHOTO])
    .filter((e) => e.endpointName === 'getPhotos')
    .map((e) =>
      dispatch(
        photosApi.util.updateQueryData('getPhotos', e.originalArgs as PhotoFilter, (draft) => {
          for (const page of draft.pages) {
            const idx = page.items.findIndex((p) => p.id === photoId);
            if (idx !== -1) page.items.splice(idx, 1);
          }
        }),
      ),
    );
}


export const photosApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPhotos: builder.infiniteQuery<PhotosPage, PhotoFilter, number>({
      infiniteQueryOptions: {
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
          const loaded = allPages.reduce((sum, page) => sum + page.items.length, 0);
          return loaded < lastPage.total ? loaded : undefined;
        },
      },
      query: ({ queryArg, pageParam }) => {
        const params = new URLSearchParams({
          offset: String(pageParam),
          limit: '30',
        });
        if (queryArg?.order) params.set('order', queryArg.order);
        if (queryArg?.season && queryArg?.year) {
          params.set('season', queryArg.season);
          params.set('year', String(queryArg.year));
        }
        return { url: `/photos?${params.toString()}` };
      },
      providesTags: [ApiTagEnum.PHOTO],
    }),

    getPeriods: builder.query<Period[], void>({
      query: () => ({ url: '/photos/periods' }),
    }),

   deletePhoto: builder.mutation<{ success: boolean }, { photoId: string }>({
      query: ({ photoId }) => ({ url: `photos/${encodeURIComponent(photoId)}`, method: 'DELETE' }),
      async onQueryStarted({ photoId }, { dispatch, queryFulfilled, getState }) {
        const patches = removeFromFeed(photoId, dispatch, getState);
        try { await queryFulfilled; } catch { patches.forEach((p) => p.undo()); }
      },
    }),

    hidePhoto: builder.mutation<{ success: boolean }, { photoId: string }>({
      query: ({ photoId }) => ({ url: `photos/${encodeURIComponent(photoId)}/hide`, method: 'PUT' }),
      async onQueryStarted({ photoId }, { dispatch, queryFulfilled, getState }) {
        const patches = removeFromFeed(photoId, dispatch, getState);
        try { await queryFulfilled; } catch { patches.forEach((p) => p.undo()); }
      },
    }),
  }),
});

export const { useGetPhotosInfiniteQuery, useGetPeriodsQuery, useDeletePhotoMutation, useHidePhotoMutation } = photosApi;
