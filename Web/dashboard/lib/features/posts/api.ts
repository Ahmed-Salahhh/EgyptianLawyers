"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { appBaseQuery } from "../base-query";
import type { HelpPostDetails, HelpPostFeedItem, ModerationItem } from "./types";

type HelpPostsFeedResponse =
  | HelpPostFeedItem[]
  | {
      data?: HelpPostFeedItem[];
      items?: HelpPostFeedItem[];
      helpPosts?: HelpPostFeedItem[];
    };

function normalizeHelpPosts(response: HelpPostsFeedResponse): HelpPostFeedItem[] {
  if (Array.isArray(response)) return response;
  return response.items ?? response.data ?? response.helpPosts ?? [];
}

function toModerationItems(posts: HelpPostFeedItem[]): ModerationItem[] {
  return posts.map((post) => ({
    id: post.id,
    type: "post",
    title: `Help Post #${post.id}`,
    meta: `${post.courtName} | ${post.cityName} | ${post.lawyerFullName}`,
    reason: post.description,
    status: "flagged",
  }));
}

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
    getFlaggedItems: builder.query<
      ModerationItem[],
      { courtId?: string; cityId?: string } | void
    >({
      query: (arg) => ({
        url: "/api/help-posts/feed",
        method: "GET",
        params:
          arg && (arg.courtId || arg.cityId)
            ? {
                ...(arg.courtId ? { courtId: arg.courtId } : {}),
                ...(arg.cityId ? { cityId: arg.cityId } : {}),
              }
            : undefined,
      }),
      transformResponse: (response: HelpPostsFeedResponse) =>
        toModerationItems(normalizeHelpPosts(response)),
      providesTags: (result) => [
        { type: "PostModeration", id: "LIST" },
        ...(result?.map((item) => ({ type: "PostModeration" as const, id: item.id })) ?? []),
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
