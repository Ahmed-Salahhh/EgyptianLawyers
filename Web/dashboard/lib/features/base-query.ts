'use client';

import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from './auth/token';

const apiBaseUrl = 'http://egyptianlawyers-001-site1.stempurl.com';

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
