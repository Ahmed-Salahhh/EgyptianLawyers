"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { appBaseQuery } from "../base-query";
import type {
  GetHelpPostsFeedRequest,
  GetHelpPostsFeedResponse,
  HelpPostDetails,
} from "./types";

function normalizeHelpPostDetails(post: HelpPostDetails): HelpPostDetails {
  return {
    ...post,
    replies: post.replies ?? [],
  };
}

export const postsApi = createApi({
  reducerPath: "postsApi",
  baseQuery: appBaseQuery,
  tagTypes: ["PostModeration"],
  endpoints: (builder) => ({
    getFlaggedItems: builder.query<GetHelpPostsFeedResponse, GetHelpPostsFeedRequest>({
      query: (req) => ({
        url: "/api/help-posts/feed",
        method: "GET",
        params: req,
      }),
      providesTags: (result) => [
        { type: "PostModeration", id: "LIST" },
        ...(result?.data.map((item) => ({ type: "PostModeration" as const, id: item.id })) ??
          []),
      ],
    }),
    getHelpPostById: builder.query<HelpPostDetails, string>({
      query: (helpPostId) => ({
        url: `/api/help-posts/${helpPostId}`,
        method: "GET",
      }),
      transformResponse: (response: HelpPostDetails) =>
        normalizeHelpPostDetails(response),
      providesTags: (_, __, helpPostId) => [{ type: "PostModeration", id: helpPostId }],
    }),
  }),
});

export const { useGetFlaggedItemsQuery, useGetHelpPostByIdQuery } = postsApi;
