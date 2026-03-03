import {
  normalizeCourtsAndCities,
  type CourtsAndCitiesResponse,
  type LookupCourt,
} from "./types";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://egyptianlawyers-001-site1.stempurl.com";

export async function fetchCourtsAndCities(token?: string | null): Promise<LookupCourt[]> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/lookups/courts-and-cities`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error("FAILED_TO_FETCH_LOOKUPS");
  }

  const data = (await response.json()) as CourtsAndCitiesResponse;
  return normalizeCourtsAndCities(data);
}
