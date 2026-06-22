import { api } from '../baseApi';
import { ApiTagEnum, type PhotoSummary } from '../types';


const empty: PhotoSummary = {
  likeCount: 0, liked: false, reactions: {}, myReaction: null, commentCount: 0,
};

export const reactionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getReactionSummary: builder.query<PhotoSummary, string>({
      query: (photoId) => ({
        url: '/reactions/summary',
        method: 'POST',
        body: { photoIds: [photoId] },
      }),
      transformResponse: (res: Record<string, PhotoSummary>, _m, photoId) =>
        res[photoId] ?? empty,
      providesTags: (_r, _e, photoId) => [{ type: ApiTagEnum.REACTION, id: photoId }],
    }),

    toggleLike: builder.mutation<PhotoSummary, { photoId: string }>({
      query: (body) => ({ url: '/reactions/like', method: 'PUT', body }),
      invalidatesTags: (_r, _e, { photoId }) => [{ type: ApiTagEnum.REACTION, id: photoId }],
      async onQueryStarted({ photoId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          reactionsApi.util.updateQueryData('getReactionSummary', photoId, (d) => {
            if (d.liked) { d.liked = false; d.likeCount = Math.max(0, d.likeCount - 1); }
            else { d.liked = true; d.likeCount += 1; }
          }),
        );
        try { await queryFulfilled; } catch { patch.undo(); }
      },
    }),

    toggleReaction: builder.mutation<PhotoSummary, { photoId: string; type: string }>({
      query: (body) => ({ url: '/reactions/reaction', method: 'PUT', body }),
      invalidatesTags: (_r, _e, { photoId }) => [{ type: ApiTagEnum.REACTION, id: photoId }],
      async onQueryStarted({ photoId, type }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          reactionsApi.util.updateQueryData('getReactionSummary', photoId, (d) => {
            const prev = d.myReaction;
            if (prev) d.reactions[prev] = Math.max(0, (d.reactions[prev] ?? 1) - 1);
            if (prev === type) d.myReaction = null;
            else { d.reactions[type] = (d.reactions[type] ?? 0) + 1; d.myReaction = type; }
          }),
        );
        try { await queryFulfilled; } catch { patch.undo(); }
      },
    }),
  }),
});

export const {
  useGetReactionSummaryQuery,
  useToggleLikeMutation,
  useToggleReactionMutation,
} = reactionsApi;
