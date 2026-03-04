"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { appBaseQuery } from "../base-query";
import type {
  GetCitiesRequest,
  GetCitiesLookupResponse,
  GetCitiesResponse,
  GetCourtsRequest,
  GetCourtsResponse,
} from "./types";

export const courtsApi = createApi({
  reducerPath: "courtsApi",
  baseQuery: appBaseQuery,
  tagTypes: ["Court", "City"],
  endpoints: (builder) => ({
    getCourts: builder.query<GetCourtsResponse, GetCourtsRequest>({
      query: (req) => ({
        url: "/api/lookups/courts/paginated",
        method: "GET",
        params: req,
      }),
      providesTags: (result) => [
        { type: "Court", id: "LIST" },
        ...(result?.data.map((court) => ({ type: "Court" as const, id: court.id })) ?? []),
      ],
    }),
    getCities: builder.query<GetCitiesResponse, GetCitiesRequest>({
      query: (req) => ({
        url: "/api/lookups/courts-and-cities/paginated",
        method: "GET",
        params: req,
      }),
      providesTags: (result) => [
        { type: "City", id: "LIST" },
        ...(result?.data.map((city) => ({ type: "City" as const, id: city.id })) ?? []),
      ],
    }),
    getCitiesLookup: builder.query<GetCitiesLookupResponse, void>({
      query: () => ({
        url: "/api/lookups/courts-and-cities",
        method: "GET",
      }),
      providesTags: (result) => [
        { type: "City", id: "LIST" },
        ...(result?.map((city) => ({ type: "City" as const, id: city.id })) ?? []),
      ],
    }),
    createCourt: builder.mutation<
      { id: string; name: string; cityId: string },
      { name: string; cityId: string }
    >({
      query: ({ name, cityId }) => ({
        url: `/api/admin/cities/${cityId}/courts`,
        method: "POST",
        body: { name, cityId },
      }),
      invalidatesTags: [
        { type: "Court", id: "LIST" },
        { type: "City", id: "LIST" },
      ],
    }),
    createCity: builder.mutation<{ id: string; name: string }, { name: string }>({
      query: ({ name }) => ({
        url: "/api/admin/cities",
        method: "POST",
        body: { name },
      }),
      invalidatesTags: [
        { type: "Court", id: "LIST" },
        { type: "City", id: "LIST" },
      ],
    }),
    updateCourt: builder.mutation<void, { id: string; name: string }>({
      query: ({ id, name }) => ({
        url: `/api/admin/courts/${id}`,
        method: "PUT",
        body: { id, name },
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "Court", id: "LIST" },
        { type: "Court", id: arg.id },
        { type: "City", id: "LIST" },
      ],
    }),
    deleteCourt: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/api/admin/courts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "Court", id: "LIST" },
        { type: "Court", id: arg.id },
        { type: "City", id: "LIST" },
      ],
    }),
    updateCity: builder.mutation<void, { id: string; name: string }>({
      query: ({ id, name }) => ({
        url: `/api/admin/cities/${id}`,
        method: "PUT",
        body: { id, name },
      }),
      invalidatesTags: [
        { type: "Court", id: "LIST" },
        { type: "City", id: "LIST" },
      ],
    }),
    deleteCity: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/api/admin/cities/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Court", id: "LIST" },
        { type: "City", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetCourtsQuery,
  useGetCitiesQuery,
  useGetCitiesLookupQuery,
  useCreateCityMutation,
  useCreateCourtMutation,
  useUpdateCourtMutation,
  useDeleteCourtMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
} = courtsApi;
