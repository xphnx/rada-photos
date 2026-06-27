import type { Credentials, User } from '../../models/Auth';
import type { ProfileMe } from '../../models/Profile';
import { api } from '../baseApi';
import { ApiTagEnum } from '../types';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<ProfileMe, void>({
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
    forgotPassword: builder.mutation<{ success: boolean }, { email: string }>({
      query: (body) => ({ url: 'auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: builder.mutation<{ success: boolean }, { token: string; password: string }>({
      query: (body) => ({ url: 'auth/reset-password', method: 'POST', body }),
    }),
  }),
});

export const {
  useGetMeQuery, useLoginMutation, useRegisterMutation, useLogoutMutation,
  useForgotPasswordMutation, useResetPasswordMutation,
} = authApi;

