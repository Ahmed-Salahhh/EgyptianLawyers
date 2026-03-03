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
