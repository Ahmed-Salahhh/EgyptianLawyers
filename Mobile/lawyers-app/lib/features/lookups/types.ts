export type LookupCity = {
  id: string;
  name: string;
};

export type LookupCourt = {
  id: string;
  name: string;
  cities: LookupCity[];
};

export type CourtsAndCitiesResponse = {
  courts: LookupCourt[];
};

export function normalizeCourtsAndCities(response: CourtsAndCitiesResponse): LookupCourt[] {
  return response.courts ?? [];
}
