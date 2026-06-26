import type { MyComment } from '../../models/Comment';
import type { Photo } from '../../models/Photo';
import type { ProfileStats } from '../../models/Profile';
import { api } from '../baseApi';
import { ApiTagEnum } from '../types';

export const profileApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStats: builder.query<ProfileStats, void>({
      query: () => ({ url: 'me/stats' }),
      providesTags: [ApiTagEnum.AUTH],
    }),
    getMyLikes: builder.query<Photo[], void>({
      query: () => ({ url: 'me/likes' }),
      providesTags: [ApiTagEnum.PHOTO],
    }),
    getMyReactions: builder.query<Photo[], void>({
      query: () => ({ url: 'me/reactions' }),
      providesTags: [ApiTagEnum.PHOTO],
    }),

    getMyComments: builder.query<MyComment[], void>({
      query: () => ({ url: 'me/comments' }),
      providesTags: [ApiTagEnum.COMMENT],
    }),
  }),
});

export const {
  useGetStatsQuery,
  useGetMyLikesQuery,
  useGetMyReactionsQuery,
  useGetMyCommentsQuery,
} = profileApi;

