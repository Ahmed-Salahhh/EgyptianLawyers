import type { PaginatedResult, SearchRequest } from "@/lib/common/pagination";

export type LawyerStatus = "pending" | "verified" | "suspended";

export type AdminLawyerCity = {
  id: string;
  name: string;
};

export type AdminLawyerListItem = {
  id: string;
  fullName: string;
  email: string;
  syndicateCardNumber: string;
  whatsAppNumber: string;
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
  cities: AdminLawyerCity[];
};

export type AdminLawyersListResponse = PaginatedResult<AdminLawyerListItem>;

export type GetLawyersRequest = SearchRequest & {
  cityId?: string;
  syndicateCardNumber?: string;
  whatsAppNumber?: string;
  isVerified?: boolean;
  isSuspended?: boolean;
};

export type ActiveCityItem = {
  id: string;
  name: string;
  courtId: string;
};

export type LawyerDetailsResponse = {
  id: string;
  fullName: string;
  title: string;
  syndicateCardNumber: string;
  whatsAppNumber: string;
  isVerified: boolean;
  createdAt: string;
  activeCities: ActiveCityItem[];
};
