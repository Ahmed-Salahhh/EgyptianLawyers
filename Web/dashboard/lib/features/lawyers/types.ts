export type LawyerStatus = "pending" | "verified" | "suspended";

export type CityKey =
  | "cityCairo"
  | "cityAlexandria"
  | "cityMansoura"
  | "cityGiza";

export type SubmittedKey = "todayTime" | "yesterday";

export type Lawyer = {
  id: string;
  name: string;
  email: string;
  cityKey: CityKey;
  status: LawyerStatus;
  whatsapp: string;
  cardNumber: string;
  createdAt: string;
  submitted: SubmittedKey;
  title: string;
  activeCourts: string[];
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
