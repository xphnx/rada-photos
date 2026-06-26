import type { Comment } from '../../models/Comment';
import { api } from '../baseApi';
import { ApiTagEnum } from '../types';

export const commentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query<Comment[], string>({
      query: (photoId) => ({ url: `comments?photoId=${photoId}` }),
      providesTags: (_result, _error, photoId) => [
        { type: ApiTagEnum.COMMENT, id: photoId },
      ],
    }),

    addComment: builder.mutation<
      { success: boolean },
      { photoId: string; text: string }
    >({
      query: (body) => ({ url: 'comments', method: 'POST', body }),
      invalidatesTags: (_result, _error, { photoId }) => [
        { type: ApiTagEnum.COMMENT, id: photoId },
      ],
    }),

    deleteComment: builder.mutation<
      { success: boolean },
      { id: string; photoId: string }
    >({
      query: ({ id }) => ({ url: `comments/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { photoId }) => [
        { type: ApiTagEnum.COMMENT, id: photoId },
      ],
    }),
  }),
});

export const {
  useGetCommentsQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
} = commentApi;
