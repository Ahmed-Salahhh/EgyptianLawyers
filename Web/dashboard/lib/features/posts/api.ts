"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { appBaseQuery } from "../base-query";
import type {
  GetHelpPostsFeedRequest,
  GetHelpPostsFeedResponse,
  HelpPostReply,
  HelpPostDetails,
} from "./types";

function normalizeReply(reply: HelpPostReply): HelpPostReply {
  return {
    ...reply,
    childReplies: (reply.childReplies ?? []).map(normalizeReply),
  };
}

function normalizeHelpPostDetails(post: HelpPostDetails): HelpPostDetails {
  return {
    ...post,
    replies: (post.replies ?? []).map(normalizeReply),
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
    deleteHelpPost: builder.mutation<void, { postId: string }>({
      query: ({ postId }) => ({
        url: `/api/admin/help-posts/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, { postId }) => [
        { type: "PostModeration", id: "LIST" },
        { type: "PostModeration", id: postId },
      ],
    }),
    deleteHelpPostReply: builder.mutation<void, { postId: string; replyId: string }>({
      query: ({ replyId }) => ({
        url: `/api/admin/help-post-replies/${replyId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, { postId }) => [
        { type: "PostModeration", id: "LIST" },
        { type: "PostModeration", id: postId },
      ],
    }),
  }),
});

export const {
  useGetFlaggedItemsQuery,
  useGetHelpPostByIdQuery,
  useDeleteHelpPostMutation,
  useDeleteHelpPostReplyMutation,
} = postsApi;
