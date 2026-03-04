export type UserNotification = {
  id: string;
  title: string;
  body: string;
  /** Raw JSON string, e.g. '{"postId":"…"}'. Parse before use. */
  dataPayload: string | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationsPage = {
  data: UserNotification[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  unreadCount: number;
};

/** Parsed content of dataPayload. */
export type NotificationPayload = {
  postId?: string;
};

export function parseNotificationPayload(raw: string | null): NotificationPayload {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as NotificationPayload;
  } catch {
    return {};
  }
}
