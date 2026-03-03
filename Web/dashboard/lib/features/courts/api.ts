"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { appBaseQuery } from "../base-query";
import type { Court, CourtCity } from "./types";

type LookupCity = {
  id: string;
  name: string;
  courtId?: string;
};

type LookupCourt = {
  id: string;
  name: string;
  isActive?: boolean;
  cities?: LookupCity[];
};

type CourtsAndCitiesResponse =
  | {
      cities?: LookupCity[];
      courts?: LookupCourt[];
      data?: Court[];
    }
  | Court[];

function normalizeCourts(payload: CourtsAndCitiesResponse): Court[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  const courts = payload.courts ?? [];

  return courts.map((court) => ({
    id: court.id,
    name: court.name,
    cities: (court.cities ?? []).map((city): CourtCity => ({
      id: city.id,
      name: city.name,
      courtId: city.courtId ?? court.id,
    })),
    isActive: court.isActive ?? true,
  }));
}

export const courtsApi = createApi({
  reducerPath: "courtsApi",
  baseQuery: appBaseQuery,
  tagTypes: ["Court", "City"],
  endpoints: (builder) => ({
    getCourts: builder.query<Court[], { query?: string }>({
      query: () => ({
        url: "/api/lookups/courts-and-cities",
        method: "GET",
      }),
      transformResponse: (response: CourtsAndCitiesResponse, _, arg) => {
        const all = normalizeCourts(response);
        const query = (arg.query ?? "").trim().toLowerCase();
        if (!query) return all;

        return all.filter((court) => {
          const courtMatch = court.name.toLowerCase().includes(query);
          const cityMatch = court.cities.some((city) =>
            city.name.toLowerCase().includes(query),
          );
          return courtMatch || cityMatch;
        });
      },
      providesTags: (result) => [
        { type: "Court", id: "LIST" },
        ...(result?.map((court) => ({ type: "Court" as const, id: court.id })) ?? []),
      ],
    }),
    createCourt: builder.mutation<{ id: string; name: string }, { name: string }>({
      query: ({ name }) => ({
        url: "/api/admin/courts",
        method: "POST",
        body: { name },
      }),
      invalidatesTags: [{ type: "Court", id: "LIST" }],
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
      ],
    }),
    addCityToCourt: builder.mutation<
      { id: string; name: string; courtId: string },
      { courtId: string; name: string }
    >({
      query: ({ courtId, name }) => ({
        url: `/api/admin/courts/${courtId}/cities`,
        method: "POST",
        body: { courtId, name },
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "Court", id: "LIST" },
        { type: "Court", id: arg.courtId },
      ],
    }),
    updateCity: builder.mutation<void, { id: string; name: string }>({
      query: ({ id, name }) => ({
        url: `/api/admin/cities/${id}`,
        method: "PUT",
        body: { id, name },
      }),
      invalidatesTags: [{ type: "Court", id: "LIST" }],
    }),
    deleteCity: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/api/admin/cities/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Court", id: "LIST" }],
    }),
  }),
});

export const {
  useGetCourtsQuery,
  useCreateCourtMutation,
  useUpdateCourtMutation,
  useDeleteCourtMutation,
  useAddCityToCourtMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
} = courtsApi;
