// Backend: City has many Courts.
// GET /api/lookups/courts-and-cities returns LookupCityDto[] (a plain JSON array).

export type LookupCourt = {
  id: string;
  name: string;
};

export type LookupCity = {
  id: string;
  name: string;
  courts: LookupCourt[];
};

export function normalizeCourtsAndCities(response: unknown): LookupCity[] {
  if (Array.isArray(response)) {
    return response as LookupCity[];
  }
  return [];
}
