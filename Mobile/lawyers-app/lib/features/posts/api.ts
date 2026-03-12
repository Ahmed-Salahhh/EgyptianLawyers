import { fetchWithAuth } from "@/lib/apiClient";
import {
  normalizeHelpPostDetails,
  normalizeFeedPage,
  type CreateHelpPostFields,
  type FeedPage,
  type HelpPostDetails,
  type PickedFile,
} from "./types";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://egyptianlawyers-001-site1.stempurl.com";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Appends a PickedFile to a FormData instance using React Native's file-object
 * format ({ uri, name, type }).  The Content-Type header must NOT be set manually
 * so that fetch can insert the correct multipart boundary automatically.
 */
function appendFile(form: FormData, file: PickedFile) {
  form.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  } as unknown as Blob);
}

// ── Feed ──────────────────────────────────────────────────────────────────────

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

  const response = await fetchWithAuth(`${API_BASE_URL}/api/help-posts/feed?${params.toString()}`, {
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

// ── Single post ───────────────────────────────────────────────────────────────

export async function fetchHelpPostById(token: string, postId: string): Promise<HelpPostDetails> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/help-posts/${postId}`, {
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

// ── Create post ───────────────────────────────────────────────────────────────

export async function createHelpPost(
  token: string,
  fields: CreateHelpPostFields,
  file?: PickedFile | null,
): Promise<void> {
  const form = new FormData();
  form.append("description", fields.description);
  form.append("courtId", fields.courtId);
  form.append("cityId", fields.cityId);
  if (file) appendFile(form, file);

  const response = await fetchWithAuth(`${API_BASE_URL}/api/help-posts`, {
    method: "POST",
    // DO NOT set Content-Type — fetch adds the multipart boundary automatically.
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to create post (HTTP ${response.status}): ${body}`);
  }
}

// ── Reply to post ─────────────────────────────────────────────────────────────

export async function replyToPost(
  token: string,
  helpPostId: string,
  comment: string | null,
  file?: PickedFile | null,
  parentReplyId?: string | null,
): Promise<void> {
  const form = new FormData();
  if (comment?.trim()) form.append("comment", comment.trim());
  if (parentReplyId) form.append("parentReplyId", parentReplyId);
  if (file) appendFile(form, file);

  const response = await fetchWithAuth(`${API_BASE_URL}/api/help-posts/${helpPostId}/replies`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to submit reply (HTTP ${response.status}): ${body}`);
  }
}

// ── Upload attachment (returns URL for use in update) ─────────────────────────

export async function uploadHelpPostAttachment(
  token: string,
  file: PickedFile,
): Promise<string> {
  const form = new FormData();
  appendFile(form, file);

  const response = await fetchWithAuth(`${API_BASE_URL}/api/help-posts/upload-attachment`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to upload attachment (HTTP ${response.status}): ${body}`);
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}

// ── Update & delete post ─────────────────────────────────────────────────────

export async function updateHelpPost(
  token: string,
  postId: string,
  description: string,
  attachmentUrl?: string | null,
): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/help-posts/${postId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ description, attachmentUrl: attachmentUrl ?? null }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to update post (HTTP ${response.status}): ${body}`);
  }
}

export async function deleteHelpPost(token: string, postId: string): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/help-posts/${postId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to delete post (HTTP ${response.status}): ${body}`);
  }
}

// ── Update & delete reply ────────────────────────────────────────────────────

export async function updateHelpPostReply(
  token: string,
  replyId: string,
  comment: string,
  attachmentUrl?: string | null,
): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/help-post-replies/${replyId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ comment, attachmentUrl: attachmentUrl ?? null }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to update reply (HTTP ${response.status}): ${body}`);
  }
}

export async function deleteHelpPostReply(token: string, replyId: string): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/help-post-replies/${replyId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to delete reply (HTTP ${response.status}): ${body}`);
  }
}
