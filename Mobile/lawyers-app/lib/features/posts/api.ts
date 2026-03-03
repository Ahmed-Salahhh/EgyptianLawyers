import {
  normalizeHelpPostDetails,
  normalizeHelpPostsFeed,
  type CreateHelpPostRequest,
  type HelpPostDetails,
  type HelpPostFeedItem,
} from "./types";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://egyptianlawyers-001-site1.stempurl.com";

export async function fetchHelpPostsFeed(token: string): Promise<HelpPostFeedItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/help-posts/feed`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("FAILED_TO_FETCH_POSTS");
  }

  const data = (await response.json()) as unknown;
  return normalizeHelpPostsFeed(data as Parameters<typeof normalizeHelpPostsFeed>[0]);
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
    throw new Error("FAILED_TO_FETCH_POST_DETAILS");
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
    throw new Error("FAILED_TO_CREATE_POST");
  }
}
