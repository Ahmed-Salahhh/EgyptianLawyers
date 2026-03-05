'use client';

import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from './auth/token';

const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? '/';
const apiBaseUrl = rawApiBaseUrl === '/' ? '/' : rawApiBaseUrl.replace(/\/+$/, '');

export const appBaseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  prepareHeaders: (headers) => {
    const token = getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    headers.set('Accept', 'application/json');
    return headers;
  },
});
