import type { PaginatedResult, SearchRequest } from "@/lib/common/pagination";

export type GetHelpPostsFeedRequest = SearchRequest & {
  courtId?: string;
  cityId?: string;
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
  createdAt: string;
};

export type GetHelpPostsFeedResponse = PaginatedResult<HelpPostFeedItem>;

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
