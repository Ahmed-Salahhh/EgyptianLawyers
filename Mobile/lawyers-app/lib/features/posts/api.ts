import {
  normalizeHelpPostDetails,
  normalizeFeedPage,
  type CreateHelpPostRequest,
  type FeedPage,
  type HelpPostDetails,
} from "./types";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://egyptianlawyers-001-site1.stempurl.com";

export async function fetchHelpPostsFeed(
  token: string,
  pageIndex = 1,
  pageSize = 20,
  filters?: { courtId?: string; cityId?: string },
): Promise<FeedPage> {
  const params = new URLSearchParams({
    pageIndex: String(pageIndex),
    pageSize: String(pageSize),
  });
  if (filters?.courtId) params.set("courtId", filters.courtId);
  if (filters?.cityId) params.set("cityId", filters.cityId);

  const response = await fetch(`${API_BASE_URL}/api/help-posts/feed?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to load feed (HTTP ${response.status}): ${body}`);
  }

  const raw = (await response.json()) as unknown;
  return normalizeFeedPage(raw);
}

export async function fetchHelpPostById(token: string, postId: string): Promise<HelpPostDetails> {
  const response = await fetch(`${API_BASE_URL}/api/help-posts/${postId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to load post (HTTP ${response.status}): ${body}`);
  }

  const data = (await response.json()) as HelpPostDetails;
  return normalizeHelpPostDetails(data);
}

export async function createHelpPost(token: string, payload: CreateHelpPostRequest): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/help-posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to create post (HTTP ${response.status}): ${body}`);
  }
}
