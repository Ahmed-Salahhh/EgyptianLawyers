// Mirrors backend PaginatedResult<T>
export type PaginatedResult<T> = {
  data: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type FeedPage = {
  items: HelpPostFeedItem[];
  totalCount: number;
  pageIndex: number;
  totalPages: number;
  hasNextPage: boolean;
};

export type HelpPostFeedItem = {
  id: string;
  description: string;
  attachmentUrl: string | null;
  courtId: string;
  courtName: string;
  cityId: string;
  cityName: string;
  lawyerId: string;
  lawyerFullName: string;
  replyCount: number;
  createdAt: string;
};

export type HelpPostReply = {
  id: string;
  lawyerId: string;
  lawyerFullName: string;
  lawyerWhatsAppNumber: string;
  parentReplyId?: string | null;
  comment: string | null;
  attachmentUrl: string | null;
  createdAt: string;
  childReplies?: HelpPostReply[];
};

export type HelpPostDetails = {
  id: string;
  description: string;
  attachmentUrl: string | null;
  courtId: string;
  courtName: string;
  cityId: string;
  cityName: string;
  lawyerId: string;
  lawyerFullName: string;
  lawyerWhatsAppNumber: string;
  createdAt: string;
  replies: HelpPostReply[];
};

/** A file selected via expo-document-picker (or any compatible picker). */
export type PickedFile = {
  uri: string;
  name: string;
  mimeType: string;
};

export type CreateHelpPostFields = {
  courtId: string;
  cityId: string;
  description: string;
};

export function normalizeFeedPage(raw: unknown): FeedPage {
  if (Array.isArray(raw)) {
    return { items: raw as HelpPostFeedItem[], totalCount: raw.length, pageIndex: 1, totalPages: 1, hasNextPage: false };
  }
  const paginated = raw as PaginatedResult<HelpPostFeedItem>;
  return {
    items: Array.isArray(paginated.data) ? paginated.data : [],
    totalCount: paginated.totalCount ?? 0,
    pageIndex: paginated.pageIndex ?? 1,
    totalPages: paginated.totalPages ?? 1,
    hasNextPage: paginated.hasNextPage ?? false,
  };
}

export function normalizeHelpPostDetails(raw: HelpPostDetails): HelpPostDetails {
  const replies = (raw.replies ?? []).map((r) => ({
    ...r,
    childReplies: r.childReplies ?? [],
  }));
  return { ...raw, replies };
}

/** Count total replies including nested children. */
export function countTotalReplies(replies: HelpPostReply[]): number {
  return replies.reduce(
    (sum, r) => sum + 1 + countTotalReplies(r.childReplies ?? []),
    0,
  );
}
