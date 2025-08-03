import { User, Board, FeatureRequest, Comment, Upvote, AccountTier, RequestStatus } from '@prisma/client'

// Extended types with relations
export type UserWithBoards = User & {
  boards: Board[]
}

export type BoardWithRequests = Board & {
  feature_requests: FeatureRequest[]
  creator: User
}

export type FeatureRequestWithDetails = FeatureRequest & {
  board: Board
  upvotes: Upvote[]
  comments: CommentWithReplies[]
}

export type CommentWithReplies = Comment & {
  replies: Comment[]
}

// Board Analytics Type
export interface BoardAnalytics {
  total_requests: number;
  total_upvotes: number;
  total_comments: number;
  status_breakdown: {
    new: number;
    in_progress: number;
    shipped: number;
    cancelled: number;
  };
  recent_activity: {
    date: string;
    requests_count: number;
    upvotes_count: number;
  }[];
  top_requests: FeatureRequest[];
}

// Form types
export interface CreateBoardFormData {
  title: string;
  description?: string;
  slug: string;
  theme_config?: Record<string, unknown>;
  is_public: boolean;
}

export interface CreateFeatureRequestFormData {
  title: string;
  description?: string;
  submitter_name?: string;
  submitter_email?: string;
}

export interface CreateCommentFormData {
  content: string;
  author_name: string;
  author_email: string;
  parent_comment_id?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Re-export Prisma types
export type {
  User,
  Board,
  FeatureRequest,
  Comment,
  Upvote,
  AccountTier,
  RequestStatus,
};