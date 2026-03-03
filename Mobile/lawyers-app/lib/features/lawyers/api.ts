import type {
  MyLawyerProfile,
  RegisterLawyerRequest,
  RegisterLawyerResponse,
  UpdateMyLawyerProfileRequest,
} from "./types";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://egyptianlawyers-001-site1.stempurl.com";

export async function registerLawyer(
  payload: RegisterLawyerRequest,
): Promise<RegisterLawyerResponse> {
  const response = await fetch(`${API_BASE_URL}/api/lawyers/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("FAILED_TO_REGISTER_LAWYER");
  }

  return (await response.json()) as RegisterLawyerResponse;
}

export async function fetchMyLawyerProfile(token: string): Promise<MyLawyerProfile> {
  const response = await fetch(`${API_BASE_URL}/api/lawyers/me`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("FAILED_TO_FETCH_ME");
  }

  return (await response.json()) as MyLawyerProfile;
}

export async function updateMyLawyerProfile(
  token: string,
  payload: UpdateMyLawyerProfileRequest,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/lawyers/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("FAILED_TO_UPDATE_ME");
  }
}
