import type { PaginatedResult, SearchRequest } from "@/lib/common/pagination";

export type CourtCity = {
  id: string;
  name: string;
  courtId: string;
};

export type Court = {
  id: string;
  name: string;
  cities: CourtCity[];
  isActive: boolean;
};

export type LookupCourtDto = {
  id: string;
  name: string;
};

export type LookupCityDto = {
  id: string;
  name: string;
  courts: LookupCourtDto[];
};

export type GetCitiesRequest = SearchRequest & {
  cityId?: string;
};

export type GetCitiesResponse = PaginatedResult<LookupCityDto>;
export type GetCitiesLookupResponse = LookupCityDto[];

export type LookupCityOption = {
  id: string;
  name: string;
};

export type LookupPaginatedCourtItem = {
  id: string;
  name: string;
};

export type GetCourtsRequest = SearchRequest & {
  cityId?: string;
  courtId?: string;
};

export type GetCourtsResponse = PaginatedResult<LookupPaginatedCourtItem>;

export function mapLookupToCourts(cities: LookupCityDto[]): Court[] {
  return cities.flatMap((city) =>
    (city.courts ?? []).map((court) => ({
      id: court.id,
      name: court.name,
      cities: [{ id: city.id, name: city.name, courtId: court.id }],
      isActive: true,
    })),
  );
}

export function mapLookupToCityOptions(
  cities: LookupCityDto[],
): LookupCityOption[] {
  return cities.map((city) => ({
    id: city.id,
    name: city.name,
  }));
}
