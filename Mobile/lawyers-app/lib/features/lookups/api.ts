import { normalizeCourtsAndCities, type LookupCity } from "./types";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://egyptianlawyers-001-site1.stempurl.com";

export async function fetchCourtsAndCities(token?: string | null): Promise<LookupCity[]> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/api/lookups/courts-and-cities`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch lookups (HTTP ${response.status})`);
  }

  const data = (await response.json()) as unknown;
  return normalizeCourtsAndCities(data);
}
