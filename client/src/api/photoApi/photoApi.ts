import { api } from '../baseApi';
import { ApiTagEnum, type PhotosPage } from '../types';

export const photosApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPhotos: builder.infiniteQuery<PhotosPage, void, number>({
      infiniteQueryOptions: {
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
          const loaded = allPages.reduce(
            (sum, page) => sum + page.items.length,
            0,
          );

          return loaded < lastPage.total ? loaded : undefined;
        },
      },
      query: ({ pageParam }) => ({
        url: `/photos?offset=${pageParam}&limit=30`,
      }),
      providesTags: [ApiTagEnum.PHOTO],
    }),
  }),
});

export const { useGetPhotosInfiniteQuery } = photosApi;
