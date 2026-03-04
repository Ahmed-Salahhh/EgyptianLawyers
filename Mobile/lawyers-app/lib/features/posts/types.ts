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
  comment: string | null;
  attachmentUrl: string | null;
  createdAt: string;
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

export type CreateHelpPostRequest = {
  courtId: string;
  cityId: string;
  description: string;
  attachmentUrl?: string | null;
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
  return { ...raw, replies: raw.replies ?? [] };
}
