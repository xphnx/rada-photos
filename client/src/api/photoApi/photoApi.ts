import { api } from '../baseApi';
import { ApiTagEnum, type PhotosPage } from '../types';
import type { Period, PhotoFilter } from '../../models/Period';

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
  }),
});

export const { useGetPhotosInfiniteQuery, useGetPeriodsQuery } = photosApi;
