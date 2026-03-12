import { fetchWithAuth } from "@/lib/apiClient";
import type { NotificationsPage } from "./types";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://egyptianlawyers-001-site1.stempurl.com";

function authHeaders(token: string) {
  return { Accept: "application/json", Authorization: `Bearer ${token}` };
}

export async function getNotifications(
  token: string,
  pageIndex = 1,
  pageSize = 20,
): Promise<NotificationsPage> {
  const params = new URLSearchParams({
    pageIndex: String(pageIndex),
    pageSize: String(pageSize),
  });

  const response = await fetchWithAuth(`${API_BASE_URL}/api/notifications?${params}`, {
    method: "GET",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to load notifications (HTTP ${response.status}): ${body}`);
  }

  return (await response.json()) as NotificationsPage;
}

export async function markNotificationAsRead(token: string, id: string): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/notifications/${id}/read`, {
    method: "PUT",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to mark notification as read (HTTP ${response.status}): ${body}`);
  }
}

export async function markAllNotificationsAsRead(token: string): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/notifications/read-all`, {
    method: "PUT",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Failed to mark all notifications as read (HTTP ${response.status}): ${body}`);
  }
}
