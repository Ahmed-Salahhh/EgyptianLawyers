"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { appBaseQuery } from "../base-query";
import type {
  AdminLawyerListItem,
  CityKey,
  Lawyer,
  LawyerDetailsResponse,
  LawyerStatus,
} from "./types";

type LawyerDetailsPayload = Partial<LawyerDetailsResponse> & {
  email?: string;
  isSuspended?: boolean;
  city?: string;
  cityName?: string;
  professionalTitle?: string;
  activeCourts?: string[];
};

type LawyersListResponse =
  | AdminLawyerListItem[]
  | {
      data?: AdminLawyerListItem[];
      items?: AdminLawyerListItem[];
      lawyers?: AdminLawyerListItem[];
    };

function mapCityKey(city?: string): CityKey {
  const value = (city ?? "").toLowerCase();
  if (value.includes("alex")) return "cityAlexandria";
  if (value.includes("mans")) return "cityMansoura";
  if (value.includes("giza")) return "cityGiza";
  return "cityCairo";
}

function mapStatus(isVerified?: boolean, isSuspended?: boolean): LawyerStatus {
  if (isSuspended) return "suspended";
  if (isVerified) return "verified";
  return "pending";
}

function normalizeLawyer(payload: LawyerDetailsPayload): Lawyer {
  const firstActiveCityName = payload.activeCities?.[0]?.name;
  const cityName = payload.cityName ?? payload.city ?? firstActiveCityName ?? "Cairo";
  const activeCourtsFromCities =
    payload.activeCities?.map((activeCity) => activeCity.name) ?? [];

  return {
    id: payload.id ?? crypto.randomUUID(),
    name: payload.fullName ?? "Unknown Lawyer",
    email: payload.email ?? "",
    cityKey: mapCityKey(cityName),
    status: mapStatus(payload.isVerified, payload.isSuspended),
    whatsapp: payload.whatsAppNumber ?? "+20 10 0000 0000",
    cardNumber: payload.syndicateCardNumber ?? "",
    createdAt: payload.createdAt ?? "",
    submitted: "yesterday",
    title: payload.professionalTitle ?? payload.title ?? "Lawyer",
    activeCourts: payload.activeCourts ?? activeCourtsFromCities,
  };
}

function normalizeLawyersList(response: LawyersListResponse): Lawyer[] {
  if (Array.isArray(response)) {
    return response.map(normalizeLawyer);
  }

  const list = response.items ?? response.data ?? response.lawyers ?? [];
  return list.map(normalizeLawyer);
}

function getLawyersQueryParams(status?: LawyerStatus | "all"): {
  isVerified?: boolean;
  isSuspended?: boolean;
} {
  if (!status || status === "all") return {};
  if (status === "verified") return { isVerified: true };
  if (status === "suspended") return { isSuspended: true };
  return { isVerified: false, isSuspended: false };
}

export const lawyersApi = createApi({
  reducerPath: "lawyersApi",
  baseQuery: appBaseQuery,
  tagTypes: ["Lawyer"],
  endpoints: (builder) => ({
    getLawyers: builder.query<Lawyer[], { status?: LawyerStatus | "all" }>({
      query: ({ status }) => ({
        url: "/api/admin/lawyers",
        method: "GET",
        params: getLawyersQueryParams(status),
      }),
      transformResponse: (response: LawyersListResponse) => normalizeLawyersList(response),
      providesTags: (result) => [
        { type: "Lawyer", id: "LIST" },
        ...(result?.map((lawyer) => ({ type: "Lawyer" as const, id: lawyer.id })) ?? []),
      ],
    }),
    getLawyerById: builder.query<Lawyer, string>({
      query: (lawyerId) => ({
        url: `/api/lawyers/${lawyerId}`,
        method: "GET",
      }),
      transformResponse: (response: LawyerDetailsResponse) => normalizeLawyer(response),
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
  }),
});

export const {
  useGetLawyersQuery,
  useGetLawyerByIdQuery,
  useApproveLawyerMutation,
  useRejectLawyerMutation,
} = lawyersApi;
