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
};

export type MyLawyerProfile = {
  id: string;
  fullName: string;
  title: string;
  syndicateCardNumber: string;
  whatsAppNumber: string;
  avatarUrl: string | null;
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
  activeCities: LawyerActiveCity[];
};

export type UpdateMyLawyerProfileRequest = {
  title: string;
  whatsAppNumber: string;
  cityIds: string[];
};

export type PublicLawyerProfile = {
  id: string;
  fullName: string;
  title: string | null;
  profilePictureUrl: string | null;
  syndicateCardNumber: string;
  whatsAppNumber: string;
  isVerified: boolean;
  createdAt: string;
  activeCities: { id: string; name: string }[];
};

export type ProfileViewer = {
  id: string;
  fullName: string;
  lastViewedAt: string;
  viewCount: number;
};

export type ProfileViewersPage = {
  data: ProfileViewer[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};
