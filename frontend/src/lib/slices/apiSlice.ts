import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.userInfo?.access_token;

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['Cart'],
  endpoints: () => ({}),
});
