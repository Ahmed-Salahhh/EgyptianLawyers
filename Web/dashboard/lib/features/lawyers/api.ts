"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { appBaseQuery } from "../base-query";
import type {
  AdminLawyersListResponse,
  AdminLawyerListItem,
  GetLawyersRequest,
  LawyerDetailsResponse,
} from "./types";

export const lawyersApi = createApi({
  reducerPath: "lawyersApi",
  baseQuery: appBaseQuery,
  tagTypes: ["Lawyer"],
  endpoints: (builder) => ({
    getLawyers: builder.query<
      AdminLawyersListResponse,
      GetLawyersRequest
    >({
      query: (req) => ({
        url: "/api/admin/lawyers",
        method: "GET",
        params: req,
      }),
      providesTags: (result) => [
        { type: "Lawyer", id: "LIST" },
        ...(result?.data.map((lawyer: AdminLawyerListItem) => ({ type: "Lawyer" as const, id: lawyer.id })) ?? []),
      ],
    }),
    getLawyerById: builder.query<LawyerDetailsResponse, string>({
      query: (lawyerId) => ({
        url: `/api/lawyers/${lawyerId}`,
        method: "GET",
      }),
      providesTags: (_, __, lawyerId) => [{ type: "Lawyer", id: lawyerId }],
    }),
    approveLawyer: builder.mutation<unknown, { lawyerId: string }>({
      query: ({ lawyerId }) => ({
        url: `/api/admin/lawyers/${lawyerId}/approve`,
        method: "PUT",
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "Lawyer", id: "LIST" },
        { type: "Lawyer", id: arg.lawyerId },
      ],
    }),
    rejectLawyer: builder.mutation<unknown, { lawyerId: string }>({
      query: ({ lawyerId }) => ({
        url: `/api/admin/lawyers/${lawyerId}/suspend`,
        method: "PUT",
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "Lawyer", id: "LIST" },
        { type: "Lawyer", id: arg.lawyerId },
      ],
    }),
    unsuspendLawyer: builder.mutation<unknown, { lawyerId: string }>({
      query: ({ lawyerId }) => ({
        url: `/api/admin/lawyers/${lawyerId}/unsuspend`,
        method: "PUT",
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "Lawyer", id: "LIST" },
        { type: "Lawyer", id: arg.lawyerId },
      ],
    }),
  }),
});

export const {
  useGetLawyersQuery,
  useGetLawyerByIdQuery,
  useApproveLawyerMutation,
  useRejectLawyerMutation,
  useUnsuspendLawyerMutation,
} = lawyersApi;
