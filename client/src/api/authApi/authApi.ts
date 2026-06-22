import type { Credentials, User } from '../../models/Auth';
import { api } from '../baseApi';
import { ApiTagEnum } from '../types';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<User, void>({
      query: () => ({
        url: `auth/me`,
      }),
      providesTags: [ApiTagEnum.AUTH],
    }),
    login: builder.mutation<User, Credentials>({
      query: (body) => ({ url: 'auth/login', method: 'POST', body }),
      invalidatesTags: [ApiTagEnum.AUTH],
    }),
    register: builder.mutation<User, Credentials>({
      query: (body) => ({ url: 'auth/register', method: 'POST', body }),
      invalidatesTags: [ApiTagEnum.AUTH],
    }),
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({ url: 'auth/logout', method: 'POST' }),
      invalidatesTags: [ApiTagEnum.AUTH],
    }),
  }),
});

export const { useGetMeQuery, useLoginMutation, useRegisterMutation, useLogoutMutation } = authApi;
