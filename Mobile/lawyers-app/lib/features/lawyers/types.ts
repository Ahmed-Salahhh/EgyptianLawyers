export type RegisterLawyerRequest = {
  fullName: string;
  title: string;
  syndicateCardNumber: string;
  whatsAppNumber: string;
  cityIds: string[];
  email: string;
  password: string;
};

export type RegisterLawyerResponse = {
  id: string;
};

export type LawyerActiveCity = {
  id: string;
  name: string;
  courtId: string;
};

export type MyLawyerProfile = {
  id: string;
  fullName: string;
  title: string;
  syndicateCardNumber: string;
  whatsAppNumber: string;
  isVerified: boolean;
  createdAt: string;
  activeCities: LawyerActiveCity[];
};

export type UpdateMyLawyerProfileRequest = {
  title: string;
  whatsAppNumber: string;
  cityIds: string[];
};
