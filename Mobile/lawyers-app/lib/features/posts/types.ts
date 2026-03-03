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
  comment: string;
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

type HelpPostsFeedResponse =
  | HelpPostFeedItem[]
  | {
      data?: HelpPostFeedItem[];
      items?: HelpPostFeedItem[];
      helpPosts?: HelpPostFeedItem[];
    };

export function normalizeHelpPostsFeed(response: HelpPostsFeedResponse): HelpPostFeedItem[] {
  if (Array.isArray(response)) {
    return response;
  }

  return response.items ?? response.data ?? response.helpPosts ?? [];
}

export function normalizeHelpPostDetails(response: HelpPostDetails): HelpPostDetails {
  return {
    ...response,
    replies: response.replies ?? [],
  };
}
