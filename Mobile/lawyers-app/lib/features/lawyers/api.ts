import { fetchWithAuth } from "@/lib/apiClient";
import type {
  MyLawyerProfile,
  ProfileViewersPage,
  PublicLawyerProfile,
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
  const response = await fetchWithAuth(`${API_BASE_URL}/api/lawyers/me`, {
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

export async function fetchPublicLawyerProfile(
  token: string,
  lawyerId: string,
): Promise<PublicLawyerProfile> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/lawyers/${lawyerId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to load profile (HTTP ${response.status}): ${body}`);
  }

  return (await response.json()) as PublicLawyerProfile;
}

export async function getProfileViewers(
  token: string,
  pageIndex = 1,
  pageSize = 20,
): Promise<ProfileViewersPage> {
  const params = new URLSearchParams({
    pageIndex: String(pageIndex),
    pageSize: String(pageSize),
  });

  const response = await fetchWithAuth(`${API_BASE_URL}/api/lawyers/viewers?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to load profile viewers (HTTP ${response.status}): ${body}`);
  }

  return (await response.json()) as ProfileViewersPage;
}

export async function updateMyLawyerProfile(
  token: string,
  payload: UpdateMyLawyerProfileRequest,
): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/lawyers/me`, {
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

export async function uploadAvatar(
  token: string,
  file: { uri: string; name: string; type: string },
): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  // React Native FormData accepts { uri, name, type } for file uploads
  formData.append("file", { uri: file.uri, name: file.name, type: file.type } as never);

  const response = await fetchWithAuth(`${API_BASE_URL}/api/lawyers/me/avatar`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to upload avatar (HTTP ${response.status}): ${body}`);
  }

  return (await response.json()) as { avatarUrl: string };
}
