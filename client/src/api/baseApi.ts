import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiTagEnum } from './types';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',           
    credentials: 'include',     
  }),
  tagTypes: Object.values(ApiTagEnum),
  endpoints: () => ({}),
});
