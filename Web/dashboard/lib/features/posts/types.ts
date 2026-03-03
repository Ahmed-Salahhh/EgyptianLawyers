export type ModerationItemType = "post" | "comment";
export type ModerationItemStatus = "flagged" | "kept" | "removed";

export type ModerationItem = {
  id: string;
  type: ModerationItemType;
  title: string;
  meta: string;
  reason: string;
  status: ModerationItemStatus;
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
  createdAt: string;
  replies: HelpPostReply[];
};
